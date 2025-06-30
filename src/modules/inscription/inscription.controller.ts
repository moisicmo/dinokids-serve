import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InscriptionService } from './inscription.service';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateInscriptionDto } from './dto/update-inscription.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';

@UseGuards(AbilitiesGuard)
@Controller('inscription')
export class InscriptionController {
  constructor(private readonly inscriptionService: InscriptionService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  create( @CurrentUser() user: JwtPayload, @Body() createInscriptionDto: CreateInscriptionDto) {
    return this.inscriptionService.create(user.id,createInscriptionDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.inscription })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.inscriptionService.findAllByStudent(paginationDto);
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
  update(@Param('id') id: string, @Body() updateInscriptionDto: UpdateInscriptionDto) {
    return this.inscriptionService.update(id, updateInscriptionDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.inscription })
  remove(@Param('id') id: string) {
    return this.inscriptionService.remove(id);
  }
}

