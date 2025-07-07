import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfMake from 'pdfmake/build/pdfmake';

import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { InvoiceType } from '@/modules/invoice/entities/invoice.entity';
import { numberToString } from '@/common';
import { PdfUtils } from '../pdf-utils';

export function buildInvoiceRollTemplate(invoice: InvoiceType): Promise<Buffer> {
  const utils = new PdfUtils();
  // const utils = new PdfUtils();
  const logoPath = path.join(__dirname, '../../../../assets/logo.png');

  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath).toString('base64')
    : null;

  const content: TDocumentDefinitions['content'] = [
    {
      image: `data:image/png;base64,${logoBase64}`,
      width: 50,
      margin: [0, 0, 0, 5],
      alignment: 'center',
    },
    { text: 'CENTRO DINOKIDS', style: 'header' },
    { text: 'CASA MATRIZ', style: 'subheader' },
    { text: 'PUNTO DE VENTA 1', style: 'subheader' },
    { text: 'BATALLON COLORADOS 13213', style: 'subheader' },
    { text: 'TELÉFONO:123213123', style: 'subheader' },
    { text: 'LA PAZ - BOLIVIA', style: 'subheader' },
    // utils.createLine(), //
    {
      text: '------------------------------------------------',
      style: 'content',
      alignment: 'center',
    },
    // 
    // operador spread
    { text: 'RECIBO', style: 'header' },
    utils.createTable(
      [
        ['Cajero :', `${invoice.staff.user.name}`, true],
        [
          'Recibo Cod. :',
          `${new Date().getFullYear()}/${invoice.id.substring(0, 4)}`,
          true
        ],
        ['Fecha :', `${format(new Date(invoice.createdAt), 'dd/MM/yyyy', { locale: es })}`, true],
        ['Hora :', `${format(new Date(invoice.createdAt), 'HH:mm', { locale: es })}`, true],
        ['Nombre :', `${invoice.buyerName}`, true],
        ['Número Doc. :', `${invoice.buyerNit}`, true],
      ],
      'right',
      'left'
    ),
    // utils.createLine(),
    {
      text: '------------------------------------------------',
      style: 'content',
      alignment: 'center',
    },
    { text: 'DETALLE', style: 'header' },
    utils.createTable(
      [...invoice.payments.map((payment) => [`${payment.debt?.type} | ${payment.debt?.inscription?.student?.code} | ${payment.debt?.inscription?.student?.user.name}`, `${payment.amount.toFixed(2)}`, false])],
      'left',
      'right',
      'auto'
    ),
    // utils.createLine(),
    {
      text: '------------------------------------------------',
      style: 'content',
      alignment: 'center',
    },
    utils.createTable(
      [
        [
          'SUB TOTAL Bs :',
          `${invoice.payments.reduce((total, payment) => total + payment.amount, 0).toFixed(2)}`,
          false
        ],
        ['DESCUENTO Bs :', '0.00', false],
        [
          'TOTAL Bs :',
          `${invoice.payments.reduce((total, payment) => total + payment.amount, 0).toFixed(2)}`,
          false
        ]
      ],
      'right',
      'right',
      'auto'
    ),
    { text: `Son: ${numberToString(invoice.payments.reduce((total, payment) => total + payment.amount, 0))} 00/100 Boliviano(s)`, style: 'content' },
    // utils.createLine(),
    {
      text: '------------------------------------------------',
      style: 'content',
      alignment: 'center',
    },
    {
      text: 'Gracias por su pago. Para obtener más información escanea el código QR.',
      style: 'content',
    },
    {
      qr: `${invoice.code}`,
      fit: 80,
      alignment: 'center',
      margin: [0, 10, 0, 0],
    },
    ...utils.createBalance({
      header: ['Tipo', 'Monto acordado', 'Deuda', 'Fecha de compromiso'],
      body: invoice.payments.map((payment) => [
        `${payment.debt?.type || '-'}`,
        `Bs. ${(payment.debt?.totalAmount ?? 0).toFixed(2)}`,
        `Bs. ${(payment.debt?.remainingBalance ?? 0).toFixed(2)}`,
        `${format(
          new Date(payment.debt.dueDate!),
          'dd-MMMM-yyyy',
          { locale: es }
        ) || '-'}`,
      ]),
    }),
  ];

  const docDefinition: TDocumentDefinitions = {
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
      header: { bold: true, alignment: 'center' },
      subheader: { alignment: 'center' },
      content: { alignment: 'justify' },
    },
  };


  return new Promise((resolve, reject) => {
    const pdfDoc = pdfMake.createPdf(docDefinition);

    pdfDoc.getBuffer((buffer) => {
      resolve(buffer);
    });

    pdfDoc.getStream().on('error', reject);
  });
}
