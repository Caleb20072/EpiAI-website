import type { MemberStatus, NotificationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createNotification } from './repository';
import { logger } from '@/lib/logger';
import { getSiteUrl, sendPlatformAlertEmail } from '@/lib/email/resend';
import { sendPushToUserId } from '@/lib/push/send';

/**
 * Statuts d'adhésion qui reçoivent les communications (emails + notifications).
 * On inclut les membres en essai (`pending`) : ils sont connectés et doivent
 * être tenus au courant, pas seulement les membres validés (`active`).
 */
export const NOTIFIABLE_MEMBER_STATUSES: MemberStatus[] = ['active', 'pending'];

const TYPE_LABELS: Record<NotificationType, string> = {
  forum: 'Forum',
  event: 'Événement',
  activity: 'Activité intranet',
  membership: 'Adhésion',
  chat: 'Chat',
  system: 'Epi\'AI',
};

type NotifyPayload = {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  skipEmail?: boolean;
  emailActionLabel?: string;
};

function buildActionUrl(link?: string): string | undefined {
  if (!link) return undefined;
  const base = getSiteUrl();
  const path = link.startsWith('/') ? link : `/${link}`;
  return `${base}/fr${path}`;
}

async function sendOfflinePush(userId: string, params: NotifyPayload) {
  try {
    await sendPushToUserId(userId, {
      title: `[${TYPE_LABELS[params.type]}] ${params.title}`,
      body: params.message,
      url: buildActionUrl(params.link),
      tag: `${params.type}-alert`,
    });
  } catch (err) {
    logger.warn('Push alert failed', { userId, type: params.type, err: String(err) });
  }
}

async function sendOfflineAlert(
  user: { id: string; email: string; firstName: string | null; memberStatus: MemberStatus },
  params: NotifyPayload,
) {
  await sendOfflinePush(user.id, params);

  if (params.skipEmail) return;
  if (!NOTIFIABLE_MEMBER_STATUSES.includes(user.memberStatus)) return;

  try {
    await sendPlatformAlertEmail({
      email: user.email,
      firstName: user.firstName || 'Membre',
      category: TYPE_LABELS[params.type],
      title: params.title,
      message: params.message,
      actionUrl: buildActionUrl(params.link),
      actionLabel: params.emailActionLabel,
    });
  } catch (err) {
    logger.warn('Offline alert email failed', {
      email: user.email,
      type: params.type,
      err: String(err),
    });
  }
}

export async function notifyUser(params: NotifyPayload & { clerkId: string }) {
  const user = await prisma.user.findUnique({
    where: { clerkId: params.clerkId },
    select: { id: true, email: true, firstName: true, memberStatus: true },
  });
  if (!user) return null;

  const notification = await createNotification({
    userId: user.id,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
  });

  await sendOfflineAlert(user, params);
  return notification;
}

export async function notifyUserByDbId(params: NotifyPayload & { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, email: true, firstName: true, memberStatus: true },
  });

  const notification = await createNotification({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
  });

  if (user) {
    await sendOfflineAlert(user, params);
  }
  return notification;
}

export async function notifyAllActiveMembers(params: NotifyPayload & { sendEmail?: boolean }) {
  const users = await prisma.user.findMany({
    where: { memberStatus: { in: NOTIFIABLE_MEMBER_STATUSES } },
    select: { id: true, email: true, firstName: true, memberStatus: true },
    take: 200,
  });

  if (users.length === 0) return 0;

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    })),
  });

  if (params.sendEmail !== false) {
    for (const user of users) {
      await sendOfflineAlert(user, params);
    }
  }

  logger.info('Bulk notifications sent', {
    count: users.length,
    type: params.type,
    email: params.sendEmail !== false,
  });
  return users.length;
}

export async function notifyAdmins(params: NotifyPayload) {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['president', 'admin_general', 'chef_pole'] },
    },
    select: { id: true, email: true, firstName: true, memberStatus: true },
  });

  if (admins.length === 0) return 0;

  await prisma.notification.createMany({
    data: admins.map((u) => ({
      userId: u.id,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    })),
  });

  for (const admin of admins) {
    await sendOfflineAlert(admin, params);
  }

  return admins.length;
}
