import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService],
  imports: [PrismaModule,CaslModule],
  exports: [InvoiceService]
})
export class InvoiceModule {}
