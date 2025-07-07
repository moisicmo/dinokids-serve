import { Content, ContentTable, TableCell } from 'pdfmake/interfaces';

export class PdfUtils {
  calculateAge(birthdate: Date): number {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  generateTable(
    label: string,
    value: string,
    isSmallWidth: boolean = false
  ): ContentTable {
    const line = this.generateLine(isSmallWidth);

    const body: TableCell[][] = [
      [
        {
          text: value,
          style: 'styleCenter',
          margin: [0, 0, 0, -5],
          lineHeight: 1,
        },
      ],
      [
        {
          text: line,
          style: 'styleCenter',
          margin: [0, -5, 0, 0],
          lineHeight: 1,
        },
      ],
      [
        {
          text: label,
          style: 'styleCenter',
          margin: [0, 0, 0, 0],
          lineHeight: 1,
        },
      ],
    ];

    return {
      table: {
        widths: ['*'],
        body,
      },
      layout: 'noBorders',
    };
  }

  private generateLine(isSmall: boolean): string {
    const lineLength = isSmall ? 10 : 20;
    return '_'.repeat(lineLength);
  }

  createTable = (content: any[], alignmentRight = 'right', alignmentLeft = 'left', widthColumnLeft = '*') => {
    return {
      table: {
        widths: ['*', widthColumnLeft],
        body: content.map(([leftText, rightText, titleBold]) => [
          { text: leftText, alignment: alignmentRight, style: { bold: titleBold } }, // Alineado a la derecha
          { text: rightText, alignment: alignmentLeft }, // Alineación flexible
        ]),
      },
      layout: 'noBorders',
    };
  };

  createLine = (): Content => ({
    canvas: [
      {
        type: 'line' as const,
        x1: 0,
        y1: 0,
        x2: 140,
        y2: 0,
        lineWidth: 0.5,
        lineColor: '#000000',
        dash: { length: 2, space: 2 },
      },
    ],
    margin: [0, 0, 0, 5], // solo margen inferior si quieres
  });



  createBalance = ({ header, body }: { header: string[]; body: any[][] }): Content[] => {
    return [
      {
        text: 'BALANCE',
        style: 'header',
        margin: [0, 5, 0, 5],
      },
      {
        table: {
          widths: header.map(() => 'auto'),
          body: [
            header.map((title) => ({ text: title, bold: true, alignment: 'center' })),
            ...body.map((row) =>
              row.map((content) => ({ text: content, alignment: 'center' }))
            ),
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: (i: number, node: any) =>
            i === 0 || i === node.table.widths.length ? 0 : 0.5,
          vLineStyle: () => ({ dash: { length: 2, space: 2 } }),
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
      },
    ];
  };

}
