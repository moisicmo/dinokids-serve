import { Controller, Get, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DebtService } from './debt.service';
import { checkAbilities } from '@/decorator';
import { TypeAction, TypeSubject } from '@prisma/client';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { PaginationDto } from '@/common';

@UseGuards(AbilitiesGuard)
@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Get()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.debtService.findAll(paginationDto);
  }

  @Get('student/:studentId')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  findAllByStudent(@Param('studentId') studentId: string) {
    return this.debtService.findAllByStudent(studentId);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  findOne(@Param('id') id: string) {
    return this.debtService.findOne(id);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  remove(@Param('id') id: string) {
    return this.debtService.remove(id);
  }
}
