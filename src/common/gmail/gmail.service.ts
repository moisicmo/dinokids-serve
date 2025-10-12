import { google } from 'googleapis';
import * as MailComposer from 'nodemailer/lib/mail-composer';
import * as fs from 'fs';
import * as path from 'path';
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
    const assetPath = path.join(process.cwd(), 'dist/assets');
    const logoPath = path.join(assetPath, 'logo.png');

    const logoBase64 = fs.existsSync(logoPath)
      ? fs.readFileSync(logoPath).toString('base64')
      : null;

    const mail = new MailComposer({
      to,
      from: envs.googleSenderEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          ${logoBase64 ? `<img src="cid:logo" alt="Logo" style="width: 120px; margin-bottom: 10px;" />` : ''}
          <div style="margin-top: 10px;">${htmlMessage}</div>
        </div>
      `,
      attachments: logoBase64
        ? [
            {
              filename: 'logo.png',
              content: logoBase64,
              encoding: 'base64',
              cid: 'logo',
            },
          ]
        : [],
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
