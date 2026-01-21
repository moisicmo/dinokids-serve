import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationDto } from '@/common';

import { checkAbilities, CurrentUser } from '@/decorator';
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/enums';
import { TypeAction } from '@/generated/prisma/enums';
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.staff })
  create(@CurrentUser() user: JwtPayload, @Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(user.email, createStaffDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.staff })
  findAll( @Query() paginationDto: PaginationDto) {
    return this.staffService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.staff })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.staff })
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.staff })
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}