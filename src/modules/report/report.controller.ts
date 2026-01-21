import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { TypeAction } from '@/generated/prisma/client';
import { checkAbilities } from '@/decorator';
import { PaginationDto } from '@/common';
import { TypeSubject } from '@/common/enums';
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }


  @Get('inscription')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.report })

  getInscriptionsInDocumentXlsx(@Query() paginationDto: PaginationDto) {
    return this.reportService.getInscriptionsInDocumentXlsx(paginationDto);
  }

  @Get('debt')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.report })
  getDebsInDocumentXlsx(@Query() paginationDto: PaginationDto) {
    return this.reportService.getDebsInDocumentXlsx(paginationDto);
  }
}

