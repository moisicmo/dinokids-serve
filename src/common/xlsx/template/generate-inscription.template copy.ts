import * as ExcelJS from 'exceljs';
import { InscriptionType } from '@/modules/inscription/entities/inscription.entity';
import { Buffer } from 'buffer';

export async function buildInscriptionTemplate(inscriptions: InscriptionType[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Inscripciones');

  // Títulos de las columnas
  worksheet.addRow([
    'Nombre Estudiante',
    'Apellido',
    'Código',
    'URL',
    'Fecha Inscripción'
  ]);

  // Agregar cada inscripción como fila
  inscriptions.forEach((inscription) => {
    worksheet.addRow([
      inscription.student?.user?.name || '',
      inscription.student?.user?.lastName || '',
      inscription.id,
      inscription.url || '',
      inscription.createdAt?.toLocaleString() || ''
    ]);
  });

  // Opcional: Autoajustar columnas
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const value = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, value.length);
    });
    column.width = maxLength + 2;
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  const nodeBuffer = Buffer.from(arrayBuffer);

  return nodeBuffer;
}
