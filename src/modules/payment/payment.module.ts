import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { DebtModule } from '../debt/debt.module';
import { GoogledriveModule } from '@/common/googledrive/googledrive.module';
import { PdfModule } from '@/common/pdf/pdf.module';
import { InvoiceModule } from '../invoice/invoice.module';
@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [PrismaModule, CaslModule, DebtModule, PdfModule, GoogledriveModule, InvoiceModule],
})
export class PaymentModule { }
