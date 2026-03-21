import { Module } from '@nestjs/common';
import { PdfTemplateService } from './pdf-template.service';
import { PdfTemplateController } from './pdf-template.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PdfModule } from '@/common/pdf/pdf.module';

@Module({
  imports: [PrismaModule, PdfModule],
  controllers: [PdfTemplateController],
  providers: [PdfTemplateService],
  exports: [PdfTemplateService],
})
export class PdfTemplateModule {}
