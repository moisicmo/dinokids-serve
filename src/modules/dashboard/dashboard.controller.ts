import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AbilitiesGuard } from '@/guard/abilities.guard';

@UseGuards(AbilitiesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }


  @Get()
  findAll() {
    return this.dashboardService.findAll();
  }
}

