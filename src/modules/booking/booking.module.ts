import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { InscriptionModule } from '../inscription/inscription.module';
import { PdfModule } from '@/common/pdf/pdf.module';
import { GoogledriveModule } from '@/common/googledrive/googledrive.module';
import { InvoiceModule } from '../invoice/invoice.module';
@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [PrismaModule, InscriptionModule, PdfModule, GoogledriveModule, InvoiceModule],
})
export class BookingModule { }
