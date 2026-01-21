import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser, RequestInfo } from '@/decorator';
import { TypeAction } from "@/generated/prisma/client";
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/enums';
@Controller('specialty')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.specialty })
  create(@CurrentUser() user: JwtPayload, @Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtyService.create(user.email, createSpecialtyDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.specialty })
  findAll(@Query() paginationDto: PaginationDto, @RequestInfo() requestInfo: RequestInfo) {
    return this.specialtyService.findAll(paginationDto, requestInfo.branchSelect);
  }

  @Get('/branch/:branchId')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.specialty })
  findAllBySpecialty(@Param('branchId') branchId: string, @Query() paginationDto: PaginationDto) {
    return this.specialtyService.findAllBySpecialty(branchId, paginationDto);
  }


  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.specialty })
  findOne(@Param('id') id: string) {
    return this.specialtyService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.specialty })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() updateSpecialtyDto: UpdateSpecialtyDto) {
    return this.specialtyService.update(id, updateSpecialtyDto, user.email);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.specialty })
  remove(@Param('id') id: string) {
    return this.specialtyService.remove(id);
  }
}

