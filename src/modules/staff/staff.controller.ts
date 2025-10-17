import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationDto } from '@/common';

import { checkAbilities, CurrentUser } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from '@prisma/client';
import { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { AuthenticatedRequest } from '@/common/extended-request';

@UseGuards(AbilitiesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.staff })
  create(@CurrentUser() user: JwtPayload, @Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(user.id, createStaffDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.staff })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.staffService.findAll(paginationDto, req.caslFilter);
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