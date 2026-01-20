import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import { InscriptionType } from '@/modules/inscription/entities/inscription.entity';
import { buildInscriptionTemplate } from './template/generate-inscription.template';
import { buildInvoiceRollTemplate } from './template/generate-invoice-roll.template';
import { InvoiceType } from '@/modules/invoice/entities/invoice.entity';

const fontPath = path.join(process.cwd(), 'dist/assets/fonts');

@Injectable()
export class PdfService {
  private printer: PdfPrinter;

  constructor() {
    const fonts = {
      Poppins: {
        normal: path.join(fontPath, 'Poppins-Regular.ttf'),
        bold: path.join(fontPath, 'Poppins-Bold.ttf'),
        italics: path.join(fontPath, 'Poppins-Italic.ttf'),
        bolditalics: path.join(fontPath, 'Poppins-MediumItalic.ttf'),
      },
    };

    this.printer = new PdfPrinter(fonts);
  }

  async generateInscription(inscription: InscriptionType): Promise<Buffer> {
    const docDefinition =  buildInscriptionTemplate(inscription);

    return new Promise((resolve, reject) => {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);

      pdfDoc.end();
    });
  }

  async generateInvoiceRoll(invoice: InvoiceType): Promise<Buffer> {
    const docDefinition = buildInvoiceRollTemplate(invoice);

    return new Promise((resolve, reject) => {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);

      pdfDoc.end();
    });
  }
}
