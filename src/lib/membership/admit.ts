import { randomBytes } from 'crypto';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { upsertUserFromClerk } from '@/lib/users/repository';
import { sendWelcomeEmail, resendErrorMessage } from '@/lib/email/resend';
import { notifyUser } from '@/lib/notifications/service';
import { reviewApplication } from './repository';

export function generateMemberPassword() {
  return randomBytes(12).toString('base64url').slice(0, 16) + '!A1';
}

export async function admitApplicationToMembership(params: {
  applicationId: string;
  reviewerId: string;
  firstName: string;
  lastName: string;
  email: string;
}) {
  const generatedPassword = generateMemberPassword();
  const client = await clerkClient();
  const clerkUser = await client.users.createUser({
    emailAddress: [params.email],
    password: generatedPassword,
    firstName: params.firstName,
    lastName: params.lastName,
    skipPasswordChecks: true,
    publicMetadata: {
      roleId: 1,
      role: 'membre',
      approvedAt: new Date().toISOString(),
      mustResetPassword: true,
    },
  });

  await upsertUserFromClerk({
    clerkId: clerkUser.id,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    role: 'membre',
    roleLevel: 1,
  });

  await prisma.user
    .update({
      where: { clerkId: clerkUser.id },
      data: { memberStatus: 'pending' },
    })
    .catch(() => {});

  let emailSentSuccessfully = false;
  let emailError: string | null = null;
  if (!process.env.RESEND_API_KEY?.trim()) {
    emailError = "RESEND_API_KEY manquante sur Netlify (Site settings → Environment variables).";
  } else {
    try {
      await sendWelcomeEmail({
        email: params.email,
        firstName: params.firstName,
        password: generatedPassword,
      });
      emailSentSuccessfully = true;
    } catch (err: unknown) {
      emailError = resendErrorMessage(err);
    }
  }

  await reviewApplication(params.applicationId, { status: 'approved' }, params.reviewerId);
  await prisma.membershipApplication.update({
    where: { id: params.applicationId },
    data: { pipelineStage: 'admitted' },
  });

  await notifyUser({
    clerkId: clerkUser.id,
    type: 'membership',
    title: "Bienvenue chez Epi'AI",
    message: 'Ta candidature a été approuvée. Explore le dashboard !',
    link: '/dashboard',
    skipEmail: true,
  });

  return {
    accountId: clerkUser.id,
    emailSent: emailSentSuccessfully,
    emailError,
    // Toujours renvoyer le mot de passe à l'admin : pour WhatsApp si le mail
    // n'arrive pas (spam) ou si Resend échoue.
    credentials: {
      email: params.email,
      password: generatedPassword,
      note: emailSentSuccessfully
        ? "Email de bienvenue envoyé. Tu peux aussi copier ces identifiants pour WhatsApp si besoin."
        : emailError ||
          "Email non envoyé. Copie ces identifiants et envoie-les au candidat (WhatsApp, etc.).",
    },
  };
}
