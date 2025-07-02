import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-payment.dto';
import { PaymentEntity } from './entities/payment.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { DebtService } from '../debt/debt.service';

@Injectable()
export class PaymentService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly debtService: DebtService,
  ) { }

  async create(userId: string, createPaymentDto: CreateCartDto) {
    const { payments, ...cartDto } = createPaymentDto;

    try {

      const invoice = await this.prisma.$transaction(async (prisma) => {
        for (const paymentsDto of payments) {
          const { debtId, amount, dueDate } = paymentsDto;

          // Creamos el pago
          const payment = await prisma.payment.create({
            data: {
              debtId,
              amount,
            },
          });

          // buscamos la deuda actualizada después del trigger
          const debt = await this.debtService.findOne(debtId);

          // si aún hay saldo pendiente actualizamos la dueDate
          if (debt.remainingBalance > 0) {
            await prisma.debts.update({
              where: { id: debtId },
              data: { dueDate },
            });
          }

          // registramos la factura
          const invoice = await prisma.invoice.create({
            data: {
              code: `COM-${payment.id}`,
              staffId: userId,
              buyerNit: cartDto.buyerNit,
              buyerName: cartDto.buyerName,
            },
          });

          // actualizamos el pago con la invoice id
          await prisma.payment.update({
            where: { id: payment.id },
            data: { invoiceId: invoice.id },
          });

          return invoice;
        }
      });

      return invoice;
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
      select: PaymentEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      select: PaymentEntity,
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id #${id} not found`);
    }

    return payment;
  }
}
