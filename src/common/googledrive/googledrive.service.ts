import { envs } from '@/config';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { PassThrough } from 'stream';

function extractFileIdFromUrl(url: string): string | null {
  const regex = /[-\w]{25,}/;
  const match = url.match(regex);
  return match ? match[0] : null;
}

@Injectable()
export class GoogledriveService {

  private driveClient;

  constructor() {
    const oauth2Client = new google.auth.OAuth2(
      envs.googledriveClientId,
      envs.googledriveClientSecret,
      envs.googledriveRedirectUri,
    );

    oauth2Client.setCredentials({
      refresh_token: envs.googledriveRefreshToken,
    });

    this.driveClient = google.drive({
      version: 'v3',
      auth: oauth2Client,
    });
  }

  async getFileBase64ById(fileId: string): Promise<string> {
    const res = await this.driveClient.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      res.data
        .on('data', (chunk) => chunks.push(chunk))
        .on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer.toString('base64'));
        })
        .on('error', (err) => reject(err));
    });
  }


  async getFileBase64ByUrl(url: string): Promise<string | null> {
    const fileId = extractFileIdFromUrl(url);
    if (!fileId) return null;
    return this.getFileBase64ById(fileId);
  }

  private async findFolderByName(name: string): Promise<string | null> {
    const res = await this.driveClient.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const files = res.data.files;
    if (files && files.length > 0) {
      return files[0].id!;
    }

    return null;
  }

  private async createFolder(name: string): Promise<string> {
    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const res = await this.driveClient.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return res.data.id!;
  }

  private async getOrCreateFolder(name: string): Promise<string> {
    let folderId = await this.findFolderByName(name);
    if (!folderId) {
      folderId = await this.createFolder(name);
    }
    return folderId;
  }

  async uploadFile(name: string, buffer: Buffer, mimeType: string, folderName?: string) {
    let parents: string[] | undefined = undefined;

    if (folderName) {
      const folderId = await this.getOrCreateFolder(folderName);
      parents = [folderId];
    }

    const stream = new PassThrough();
    stream.end(buffer);

    const media = {
      mimeType,
      body: stream,
    };

    const res = await this.driveClient.files.create({
      requestBody: {
        name,
        parents,
      },
      media,
      fields: 'id, name, webViewLink',
    });
    return res.data;

  }


}
