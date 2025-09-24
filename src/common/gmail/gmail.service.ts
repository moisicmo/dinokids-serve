import { google } from 'googleapis';
import * as MailComposer from 'nodemailer/lib/mail-composer';
import { envs } from '@/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GmailService {
  private gmailClient;

  constructor() {
    const oauth2Client = new google.auth.OAuth2(
      envs.googledriveClientId,
      envs.googledriveClientSecret,
      envs.googledriveRedirectUri,
    );

    oauth2Client.setCredentials({
      refresh_token: envs.googledriveRefreshToken,
    });

    this.gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async sendEmail(to: string, subject: string, htmlMessage: string) {
    const mail = new MailComposer({
      to,
      from: envs.googleSenderEmail,
      subject,
      html: htmlMessage,
      attachments: [
        {
          filename: 'logo.png',
          path: 'src/assets/logo.png',
          cid: 'logo', // se usa en <img src="cid:logo" />
        },
      ],
    });

    const message = await new Promise<Buffer>((resolve, reject) => {
      mail.compile().build((err, msg) => {
        if (err) reject(err);
        else resolve(msg);
      });
    });

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.gmailClient.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
  }
}
