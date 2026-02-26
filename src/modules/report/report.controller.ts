import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { TypeAction } from '@/generated/prisma/client';
import { checkAbilities } from '@/decorator';
import { TypeSubject } from '@/common/enums';
import { ReportDto } from './dto/report.dto';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Get('inscription')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.report })
  getInscriptionsInDocumentXlsx(@Query() reportDto: ReportDto) {
    return this.reportService.getInscriptionsInDocumentXlsx(reportDto);
  }

  @Get('debt')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.report })
  getDebsInDocumentXlsx(@Query() reportDto: ReportDto) {
    return this.reportService.getDebsInDocumentXlsx(reportDto);
  }
}

