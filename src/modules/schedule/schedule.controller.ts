import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PaginationDto } from '@/common';
import { checkAbilities } from '@/decorator';
import { TypeAction } from "@/generated/prisma/client";
import { TypeSubject } from '@/common/enums';
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.schedule })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.scheduleService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.schedule })
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.schedule })
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.schedule })
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }
}

