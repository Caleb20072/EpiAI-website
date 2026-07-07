import { prisma } from '@/lib/prisma';

export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  userAgent?: string,
) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
    },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
    },
  });
}

export async function removePushSubscription(userId: string, endpoint: string) {
  return prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

export async function removePushSubscriptionByEndpoint(endpoint: string) {
  return prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

export async function getUserPushSubscriptions(userId: string) {
  return prisma.pushSubscription.findMany({ where: { userId } });
}

export async function getClerkPushSubscriptions(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, pushSubscriptions: true },
  });
  if (!user) return [];
  return user.pushSubscriptions;
}
