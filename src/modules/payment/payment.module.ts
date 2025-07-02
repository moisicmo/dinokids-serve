import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { DebtModule } from '../debt/debt.module';
@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [PrismaModule,CaslModule,DebtModule],
})
export class PaymentModule { }
