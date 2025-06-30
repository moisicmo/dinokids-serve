import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { InscriptionDebtService } from './inscription-debt.service';
import { CreateInscriptionDebtDto } from './dto/create-inscription-debt.dto';
import { checkAbilities } from '@/decorator';
import { TypeAction, TypeSubject } from '@prisma/client';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { PaginationDto } from '@/common';

@UseGuards(AbilitiesGuard)
@Controller('inscription-debt')
export class InscriptionDebtController {
  constructor(private readonly inscriptionDebtService: InscriptionDebtService) {}

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  create(@Body() createInscriptionDebtDto: CreateInscriptionDebtDto) {
    return this.inscriptionDebtService.create(createInscriptionDebtDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.inscriptionDebtService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  findOne(@Param('id') id: string) {
    return this.inscriptionDebtService.findOne(id);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  remove(@Param('id') id: string) {
    return this.inscriptionDebtService.remove(id);
  }
}
