import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";
import { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { AuthenticatedRequest } from '@/common/extended-request';

@UseGuards(AbilitiesGuard)
@Controller('specialty')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.specialty })
  create(@CurrentUser() user: JwtPayload, @Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtyService.create(user.id, createSpecialtyDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.specialty })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.specialtyService.findAll(paginationDto, req.caslFilter);
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

