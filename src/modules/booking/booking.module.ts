import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { InscriptionModule } from '../inscription/inscription.module';
import { PdfModule } from '@/common/pdf/pdf.module';
import { StorageModule } from '@/common/storage/storage.module';
import { InvoiceModule } from '../invoice/invoice.module';
@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [PrismaModule, InscriptionModule, PdfModule, StorageModule, InvoiceModule],
})
export class BookingModule { }
