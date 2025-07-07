import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { AbilitiesGuard } from '@/guard/abilities.guard';

@UseGuards(AbilitiesGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }


  @Get('inscription')
  getInscriptionsInDocumentXlsx() {
    return this.reportService.getInscriptionsInDocumentXlsx();
  }

  @Get('debt')
  getDebsInDocumentXlsx() {
    return this.reportService.getDebsInDocumentXlsx();
  }
}

