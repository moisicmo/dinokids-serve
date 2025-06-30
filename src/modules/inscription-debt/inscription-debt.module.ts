import { Module } from '@nestjs/common';
import { InscriptionDebtService } from './inscription-debt.service';
import { InscriptionDebtController } from './inscription-debt.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { PdfModule } from '@/common/pdf/pdf.module';
import { GoogledriveModule } from '@/common/googledrive/googledrive.module';

@Module({
  controllers: [InscriptionDebtController],
  providers: [InscriptionDebtService],
  imports: [PrismaModule, CaslModule, PdfModule, GoogledriveModule],
})
export class InscriptionDebtModule {}
