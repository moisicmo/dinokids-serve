import { Injectable } from '@nestjs/common';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as fs from 'fs';
import * as path from 'path';
import { InscriptionType } from '@/modules/inscription/entities/inscription.entity';
import { buildInscriptionTemplate } from './template/generate-inscription.template';
import { buildInvoiceRollTemplate } from './template/generate-invoice-roll.template';
import { InvoiceType } from '@/modules/invoice/entities/invoice.entity';

const fontPath = path.join(process.cwd(), 'dist/assets/fonts');


@Injectable()
export class PdfService {

  constructor() {
    (pdfMake as any).vfs = {};
    const poppinsPaths = {
      'Poppins-Regular.ttf': path.join(fontPath, 'Poppins-Regular.ttf'),
      'Poppins-Medium.ttf': path.join(fontPath, 'Poppins-Medium.ttf'),
      'Poppins-Italic.ttf': path.join(fontPath, 'Poppins-Italic.ttf'),
      'Poppins-MediumItalic.ttf': path.join(fontPath, 'Poppins-MediumItalic.ttf'),
    };

    for (const [key, filePath] of Object.entries(poppinsPaths)) {
      if (fs.existsSync(filePath)) {
        (pdfMake as any).vfs[key] = fs.readFileSync(filePath).toString('base64');
      }
    }

    (pdfMake as any).fonts = {
      Poppins: {
        normal: 'Poppins-Regular.ttf',
        bold: 'Poppins-Regular.ttf',
        italics: 'Poppins-Regular.ttf',
        bolditalics: 'Poppins-Regular.ttf',
      },
    };
  }


  async generateInscription(inscription: InscriptionType): Promise<Buffer> {
    const documentDefinition = await buildInscriptionTemplate(inscription);
    return documentDefinition;
  }

  async generateInvoiceRoll(invoice: InvoiceType): Promise<Buffer> {
    const documentDefinition = await buildInvoiceRollTemplate(invoice);
    return documentDefinition;
  }


}
