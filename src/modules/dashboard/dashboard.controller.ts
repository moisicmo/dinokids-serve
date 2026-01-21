import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RequestInfo } from '@/decorator';
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }


  @Get()
  findAll(@RequestInfo() requestInfo: RequestInfo) {
    return this.dashboardService.findAll(requestInfo.branchSelect);
  }
}

