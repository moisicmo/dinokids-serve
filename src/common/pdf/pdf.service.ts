import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';
import { InscriptionType } from '@/modules/inscription/entities/inscription.entity';
import { buildInscriptionTemplate } from './template/generate-inscription.template';
import { buildInvoiceRollTemplate } from './template/generate-invoice-roll.template';
import { InvoiceType } from '@/modules/invoice/entities/invoice.entity';
import { htmlToPdfmakeContent } from './html-to-pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

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

  async generateFromHtml(html: string): Promise<Buffer> {
    const assetsPath = path.join(process.cwd(), 'dist/assets');
    const logoPath = path.join(assetsPath, 'logo.png');
    const logoBase64 = fs.existsSync(logoPath)
      ? fs.readFileSync(logoPath).toString('base64')
      : null;

    const content = htmlToPdfmakeContent(html) as TDocumentDefinitions['content'];

    const headerColumns: any[] = [
      {
        stack: [
          { text: 'DINO KIDS. 4758808011', bold: true, color: 'green', fontSize: 12 },
          { text: 'Calle Batallón Colorados', fontSize: 10 },
          { text: 'Edificio Batallón Colorados Of. 4', fontSize: 10 },
          { text: 'www.dinokids.com.bo', fontSize: 10, color: 'gray' },
        ],
        width: '*',
      },
    ];

    if (logoBase64) {
      headerColumns.push({
        image: `data:image/png;base64,${logoBase64}`,
        width: 100,
        alignment: 'right',
      });
    }

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [70, 90, 70, 60],
      header: {
        margin: [70, 20, 70, 10],
        columns: headerColumns,
      },
      content,
      defaultStyle: {
        font: 'Poppins',
        fontSize: 11,
        lineHeight: 1.15,
      },
    };

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
