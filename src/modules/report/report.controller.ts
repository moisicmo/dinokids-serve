import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from '@prisma/client';
import { checkAbilities } from '@/decorator';
import { AuthenticatedRequest } from '@/common/extended-request';
import { PaginationDto } from '@/common';

@UseGuards(AbilitiesGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }


  @Get('inscription')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.report })

  getInscriptionsInDocumentXlsx(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reportService.getInscriptionsInDocumentXlsx(paginationDto, req.caslFilter);
  }

  @Get('debt')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.report })
  getDebsInDocumentXlsx(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reportService.getDebsInDocumentXlsx(paginationDto, req.caslFilter);
  }
}

