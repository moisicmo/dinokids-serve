import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService {
  private readonly uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  private ensureDir(folder: string): string {
    const dir = path.join(this.uploadsDir, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Guarda un buffer como archivo local.
   * Retorna { webViewLink } para ser compatible con el contrato de GoogleDrive.
   */
  async uploadFile(filename: string, buffer: Buffer, _mimeType: string, folder: string): Promise<{ webViewLink: string }> {
    const dir = this.ensureDir(folder);
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);
    const relativePath = `/uploads/${folder}/${filename}`;
    const baseUrl = process.env.APP_URL ?? '';
    const webViewLink = `${baseUrl}${relativePath}`;
    return { webViewLink };
  }

  /**
   * Lee un archivo por su URL (absoluta o relativa /uploads/...) y lo devuelve como base64.
   * Reemplaza googledriveService.getFileBase64ByUrl().
   */
  async getFileBase64ByUrl(url: string): Promise<string | null> {
    try {
      // Extraer solo el path /uploads/... desde URLs absolutas o relativas
      let relativePath = url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parsed = new URL(url);
        relativePath = parsed.pathname;
      }
      relativePath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
      const filepath = path.join(process.cwd(), 'public', relativePath);
      if (!fs.existsSync(filepath)) return null;
      return fs.readFileSync(filepath).toString('base64');
    } catch {
      return null;
    }
  }

  deleteFile(url: string): void {
    try {
      const relative = url.startsWith('/') ? url.slice(1) : url;
      const filepath = path.join(process.cwd(), 'public', relative);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } catch {
      // ignorar
    }
  }
}
