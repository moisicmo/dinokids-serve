import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-payment.dto';
import { Paymentselect } from './entities/payment.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { DebtService } from '../debt/debt.service';
import { PdfService } from '@/common/pdf/pdf.service';
import { GoogledriveService } from '@/common/googledrive/googledrive.service';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class PaymentService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly debtService: DebtService,
    private readonly invoiceService: InvoiceService,
    private readonly pdfService: PdfService,
    private readonly googledriveService: GoogledriveService,
  ) { }

  async create(userId: string, createPaymentDto: CreateCartDto) {
    const { payments, ...cartDto } = createPaymentDto;

    try {
      const invoice = await this.prisma.$transaction(async (prisma) => {
        const paymentIds: string[] = [];

        for (const paymentsDto of payments) {
          const { debtId, amount, dueDate } = paymentsDto;

          // Crear el pago
          const payment = await prisma.payment.create({
            data: { debtId, amount },
          });

          paymentIds.push(payment.id);

          // Buscar la deuda actualizada
          const debt = await this.debtService.findOne(debtId);

          // Si aún hay saldo pendiente, actualizar dueDate
          if (debt.remainingBalance > 0) {
            await prisma.debts.update({
              where: { id: debtId },
              data: { dueDate },
            });
          }
        }

        // Crear una sola factura
        const invoice = await prisma.invoice.create({
          data: {
            code: `COM-${Date.now()}`, // o algún otro generador
            staffId: userId,
            buyerNit: cartDto.buyerNit,
            buyerName: cartDto.buyerName,
          },
        });

        // Asociar todos los pagos con la factura creada
        await prisma.payment.updateMany({
          where: { id: { in: paymentIds } },
          data: { invoiceId: invoice.id },
        });

        return invoice;
      });

      const finalInvoice = await this.invoiceService.findOne(invoice.id);
      const pdfBuffer = await this.pdfService.generateInvoiceRoll(finalInvoice);
      const { webViewLink } = await this.googledriveService.uploadFile(
        `inv${finalInvoice.id}.pdf`,
        pdfBuffer,
        'application/pdf',
        'comprobantes'
      );

      // 🔴 Posible error aquí: estás actualizando una `inscription` con el ID de la invoice
      // 🟢 Si lo correcto es actualizar la `invoice`, hazlo así:
      await this.prisma.invoice.update({
        where: { id: finalInvoice.id },
        data: { url: webViewLink },
      });

      return {
        finalInvoice,
        pdfBase64: pdfBuffer.toString('base64'),
      };
    } catch (error) {
      console.error('Error al crear pagos e invoices:', error);
      throw new Error('No se pudo completar la transacción de pagos.');
    }
  }



  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.payment.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.payment.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: Paymentselect,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      select: Paymentselect,
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id #${id} not found`);
    }

    return payment;
  }
}
