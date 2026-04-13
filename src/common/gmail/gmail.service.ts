import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { envs } from '@/config';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class GmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: envs.googleSenderEmail,
        pass: envs.googleAppPassword,
      },
    });
  }

  async sendEmail(to: string, subject: string, htmlMessage: string) {
    const assetPath = path.join(process.cwd(), 'dist/assets');
    const logoPath = path.join(assetPath, 'logo.png');

    const logoExists = fs.existsSync(logoPath);

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"DinoKids" <${envs.googleSenderEmail}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          ${logoExists ? `<img src="cid:logo" alt="Logo" style="width: 120px; margin-bottom: 10px;" />` : ''}
          <div style="margin-top: 10px;">${htmlMessage}</div>
        </div>
      `,
      attachments: logoExists
        ? [
            {
              filename: 'logo.png',
              path: logoPath,
              cid: 'logo',
            },
          ]
        : [],
    };

    return this.transporter.sendMail(mailOptions);
  }
}
