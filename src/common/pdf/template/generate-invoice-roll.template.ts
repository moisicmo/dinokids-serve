import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { numberToString } from '@/common';
import { PdfUtils } from '../pdf-utils';
import { InvoiceType } from '@/modules/invoice/entities/invoice.entity';

const assetsPath = path.join(process.cwd(), 'dist/assets');

export function buildInvoiceRollTemplate(
  invoice: InvoiceType
): TDocumentDefinitions {

  const utils = new PdfUtils();

  const logoPath = path.join(assetsPath, 'logo.png');
  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath).toString('base64')
    : null;

  const content: TDocumentDefinitions['content'] = [
    ...(logoBase64
      ? [{
          image: `data:image/png;base64,${logoBase64}`,
          width: 50,
          margin: [0, 0, 0, 5] as [number, number, number, number],
          alignment: 'center' as const,
        }]
      : []),

    { text: 'CENTRO DINOKIDS', style: 'header' },
    { text: 'CASA MATRIZ', style: 'subheader' },
    { text: 'PUNTO DE VENTA 1', style: 'subheader' },
    { text: 'BATALLON COLORADOS 13213', style: 'subheader' },
    { text: 'TELÉFONO: 123213123', style: 'subheader' },
    { text: 'LA PAZ - BOLIVIA', style: 'subheader' },

    {
      text: '------------------------------------------------',
      style: 'content',
      alignment: 'center' as const,
    },

    { text: 'RECIBO', style: 'header' },

    utils.createTable(
      [
        ['Cajero :', invoice.createdBy, true],
        ['Recibo Cod. :', `${new Date().getFullYear()}/${invoice.id.substring(0, 4)}`, true],
        ['Fecha :', format(new Date(invoice.createdAt), 'dd/MM/yyyy', { locale: es }), true],
        ['Hora :', format(new Date(invoice.createdAt), 'HH:mm', { locale: es }), true],
        ['Nombre :', invoice.buyerName, true],
        ['Número Doc. :', invoice.buyerNit, true],
      ],
      'right',
      'left'
    ),

    {
      text: '------------------------------------------------',
      style: 'content',
      alignment: 'center' as const,
    },

    { text: 'DETALLE', style: 'header' },

    utils.createTable(
      invoice.payments.map(payment => {
        const parts = [
          translateDebtType(payment.debt?.type),
          payment.debt?.inscription?.student?.code,
          payment.debt?.inscription?.student?.user?.name ??
            payment.debt?.inscription?.booking?.name,
        ].filter(Boolean);

        return [parts.join(' | '), payment.amount.toFixed(2), false];
      }),
      'left',
      'right',
      'auto'
    ),

    {
      text: '------------------------------------------------',
      style: 'content',
      alignment: 'center' as const,
    },

    utils.createTable(
      [
        ['SUB TOTAL Bs :', invoice.payments.reduce((t, p) => t + p.amount, 0).toFixed(2), false],
        ['DESCUENTO Bs :', '0.00', false],
        ['TOTAL Bs :', invoice.payments.reduce((t, p) => t + p.amount, 0).toFixed(2), false],
      ],
      'right',
      'right',
      'auto'
    ),

    {
      text: `Son: ${numberToString(
        invoice.payments.reduce((t, p) => t + p.amount, 0)
      )} 00/100 Boliviano(s)`,
      style: 'content',
    },

    {
      text: '------------------------------------------------',
      style: 'content',
      alignment: 'center' as const,
    },

    {
      text: 'Gracias por su pago. Para obtener más información escanea el código QR.',
      style: 'content',
    },

    {
      qr: invoice.code,
      fit: 80,
      alignment: 'center' as const,
      margin: [0, 10, 0, 0] as [number, number, number, number],
    },
  ];

  return {
    pageMargins: [15, 25, 15, 15],
    content,
    defaultStyle: {
      font: 'Poppins',
      fontSize: 5,
      lineHeight: 1.2,
    },
    pageSize: {
      width: 164,
      height: 'auto',
    },
    styles: {
      header: { bold: true, alignment: 'center' as const },
      subheader: { alignment: 'center' as const },
      content: { alignment: 'justify' as const },
    },
  };
}

const translateDebtType = (type?: string) => {
  switch (type) {
    case 'BOOKING':
      return 'RESERVA';
    case 'INSCRIPTION':
      return 'INSCRIPCIÓN';
    default:
      return type || '-';
  }
};
