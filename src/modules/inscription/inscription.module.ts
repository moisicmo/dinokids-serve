import { Module } from '@nestjs/common';
import { InscriptionService } from './inscription.service';
import { InscriptionController } from './inscription.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PdfModule } from '@/common/pdf/pdf.module';
import { GoogledriveModule } from '@/common/googledrive/googledrive.module';
import { PdfTemplateModule } from '@/modules/pdf-template/pdf-template.module';

@Module({
  controllers: [InscriptionController],
  providers: [InscriptionService],
  imports: [PrismaModule, PdfModule, GoogledriveModule, PdfTemplateModule],
  exports: [InscriptionService],
})
export class InscriptionModule { }
