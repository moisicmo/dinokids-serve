import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { XlsxModule } from '@/common/xlsx/xlsx.module';
@Module({
  controllers: [ReportController],
  providers: [ReportService],
  imports: [PrismaModule,CaslModule, XlsxModule],
})
export class ReportModule { }
