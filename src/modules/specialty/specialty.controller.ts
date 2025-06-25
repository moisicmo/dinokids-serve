import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { PaginationDto } from '@/common';
import { checkAbilities } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";

@UseGuards(AbilitiesGuard)
@Controller('specialty')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.specialty })
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtyService.create(createSpecialtyDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.specialty })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.specialtyService.findAll(paginationDto);
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
  update(@Param('id') id: string, @Body() updateSpecialtyDto: UpdateSpecialtyDto) {
    return this.specialtyService.update(id, updateSpecialtyDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.specialty })
  remove(@Param('id') id: string) {
    return this.specialtyService.remove(id);
  }
}

