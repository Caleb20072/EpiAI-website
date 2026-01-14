import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WelcomeEmailParams {
  email: string;
  firstName: string;
  password: string;
}

export async function sendWelcomeEmail({ email, firstName, password }: WelcomeEmailParams) {
  const { data, error } = await resend.emails.send({
    from: 'Epi\'AI <membership@epiai.eu>',
    to: [email],
    subject: 'Bienvenue chez Epi\'AI - Tes identifiants de connexion',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <tr>
              <td style="background-color: #18181b; border-radius: 12px 12px 0 0; padding: 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Epi'AI</h1>
                <p style="color: #a1a1aa; margin: 10px 0 0 0;">Scientific Excellence at Epitech</p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #27272a; padding: 40px;">
                <h2 style="color: #ffffff; margin: 0 0 20px 0;">Bienvenue, ${firstName} !</h2>
                <p style="color: #d4d4d8; line-height: 1.6; margin: 0 0 20px 0;">
                  Ta candidature a été approuvée par l'équipe Epi'AI. Tu fais maintenant partie de notre communauté !
                </p>

                <div style="background-color: #18181b; border-radius: 8px; padding: 24px; margin: 24px 0;">
                  <p style="color: #a1a1aa; margin: 0 0 12px 0; font-size: 14px;">Voici tes identifiants de connexion :</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="color: #d4d4d8; padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                        <strong>Email :</strong> ${email}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #d4d4d8; padding: 8px 0;">
                        <strong>Mot de passe :</strong> ${password}
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="color: #fbbf24; line-height: 1.6; margin: 0 0 20px 0;">
                  ⚠️ <strong>Important :</strong> Tu devras changer ton mot de passe lors de ta première connexion.
                </p>

                <a href="https://epiai.eu/fr/sign-in"
                   style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin-top: 16px;">
                  Se connecter
                </a>
              </td>
            </tr>
            <tr>
              <td style="background-color: #18181b; border-radius: 0 0 12px 12px; padding: 30px; text-align: center;">
                <p style="color: #71717a; font-size: 14px; margin: 0;">
                  Epi'AI - L'excellence scientifique au cœur d'Epitech
                </p>
                <p style="color: #52525b; font-size: 12px; margin: 10px 0 0 0;">
                  © ${new Date().getFullYear()} Epi'AI. Tous droits réservés.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    throw error;
  }

  return data;
}

export async function sendApplicationReceivedEmail(email: string, firstName: string) {
  const { error } = await resend.emails.send({
    from: 'Epi\'AI <membership@epiai.eu>',
    to: [email],
    subject: 'Candidature reçue - Epi\'AI',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <tr>
              <td style="background-color: #18181b; border-radius: 12px 12px 0 0; padding: 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">Epi'AI</h1>
              </td>
            </tr>
            <tr>
              <td style="background-color: #27272a; padding: 40px;">
                <h2 style="color: #ffffff; margin: 0 0 20px 0;">Merci, ${firstName} !</h2>
                <p style="color: #d4d4d8; line-height: 1.6;">
                  Ta candidature a été reçue avec succès. Notre équipe va l'examiner et tu recevras une réponse sous peu.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #18181b; border-radius: 0 0 12px 12px; padding: 30px; text-align: center;">
                <p style="color: #71717a; font-size: 14px; margin: 0;">© ${new Date().getFullYear()} Epi'AI</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    throw error;
  }
}
