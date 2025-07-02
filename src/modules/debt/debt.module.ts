import { Module } from '@nestjs/common';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { PdfModule } from '@/common/pdf/pdf.module';
import { GoogledriveModule } from '@/common/googledrive/googledrive.module';

@Module({
  controllers: [DebtController],
  providers: [DebtService],
  imports: [PrismaModule, CaslModule, PdfModule, GoogledriveModule],
   exports: [DebtService]
})
export class DebtModule {}
