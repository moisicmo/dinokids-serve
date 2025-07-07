import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import { DebtType } from '@/modules/debt/entities/debt.entity';

export async function buildDebtTemplate(debts: DebtType[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Inscripciones');

  // Títulos de las columnas
  worksheet.addRow([
    'Código del estudiante',
    'Nombre estudiante',
    'Apellido',
    'Código de la deuda',
    'Monto total',
    'Saldo',
    'Fecha Vencimiento',
    'Fecha Inscripción'
  ]);
  // Agregar cada inscripción como fila
  debts.forEach((debt) => {
    worksheet.addRow([
      debt.inscription?.student?.code || '',
      debt.inscription?.student?.user?.name || '',
      debt.inscription?.student?.user?.lastName || '',
      debt.id,
      debt.totalAmount || '',
      debt.remainingBalance || '',
      debt.dueDate?.toLocaleString() || '',
      debt.createdAt?.toLocaleString() || '',
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
