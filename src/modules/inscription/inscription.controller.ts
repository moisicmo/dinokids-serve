import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InscriptionService } from './inscription.service';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateInscriptionDto } from './dto/update-inscription.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser, RequestInfo } from '@/decorator';
import { TypeAction } from "@/generated/prisma/client";
import type { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/enums';
@Controller('inscription')
export class InscriptionController {
  constructor(private readonly inscriptionService: InscriptionService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  create(@CurrentUser() user: JwtPayload, @Body() createInscriptionDto: CreateInscriptionDto) {
    return this.inscriptionService.create(user.email, createInscriptionDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.inscription })
  findAll(@Query() paginationDto: PaginationDto, @RequestInfo() requestInfo: RequestInfo) {
    return this.inscriptionService.findAllByStudent(paginationDto, requestInfo.branchSelect);
  }
  
  @Get('pdf/:id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.inscription })
  findPdf(@Param('id') id: string) {
    return this.inscriptionService.findPdf(id);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.inscription })
  findOne(@Param('id') id: string) {
    return this.inscriptionService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.inscription })
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() updateInscriptionDto: UpdateInscriptionDto) {
    return this.inscriptionService.update(user.email, id, updateInscriptionDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.inscription })
  remove(@Param('id') id: string) {
    return this.inscriptionService.remove(id);
  }
}

