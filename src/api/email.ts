import { log } from '@/lib/log';
import emailjs from '@emailjs/browser';

const TEMPLATE_IDS = {
  accept: 'template_p9ydgov',
  notification: 'template_fgqpqu8',
};

const options = {
  publicKey: import.meta.env.VITE_APP_MAIL_PUBLIC_KEY,
};

/**
 * Sends a mail to notify the user that their request has been accepted
 * @param email of the user to send the mail to
 * @param receiver name/id of the user to send the mail to - receiver is a part of the email template, meaning it will be included in the email
 * @param sender name/id of the user that accepted the request - sender is a part of the email template, meaning it will be included in the email
 * @param team name of the team that the user was accepted to
 */
export async function sendAcceptMail({
  email,
  receiver,
  sender,
  team,
}: {
  email: string;
  receiver: string;
  sender: string;
  team: string;
}) {
  if (!isMailEnabled()) return;

  const params = {
    to_mail: email,
    to_name: receiver,
    from_name: sender,
    team_name: team,
    app_url: import.meta.env.VITE_APP_BASE_URL,
  };

  await emailjs.send(
    import.meta.env.VITE_APP_MAIL_ID,
    TEMPLATE_IDS.accept,
    params,
    options
  );
}

/**
 * Send mail to notify team owner that a user has requested to join their team
 * @param email of the owner
 * @param receiver is the owner - receiver is a part of the email template, meaning it will be included in the email
 * @param sender is the user wishing to join a team - sender is a part of the email template, meaning it will be included in the email
 */
export async function sendInvitationMail({
  email,
  receiver,
  sender,
}: {
  email: string;
  receiver: string;
  sender: string;
}) {
  if (!isMailEnabled()) return;

  const params = {
    to_name: receiver,
    to_mail: email,
    from_name: sender,
    inbox_url: `${import.meta.env.VITE_APP_BASE_URL}/my-pages/inbox`,
  };

  emailjs.send(
    import.meta.env.VITE_APP_MAIL_ID,
    TEMPLATE_IDS.notification,
    params,
    options
  );
}

/**
 * Checks if mail should be sent
 * @return always true in production. In dev, it will only return true if the
 * env variable for enabling mail is set to true
 */
function isMailEnabled() {
  const isEnabled =
    import.meta.env.PROD || import.meta.env.VITE_APP_ENABLE_MAIL === 'true';

  if (!isEnabled) {
    log({
      type: 'info',
      label: 'Mail Service',
      message: 'Mail service is disabled',
    });
  }

  return isEnabled;
}
