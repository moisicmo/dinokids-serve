import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { DebtService } from './debt.service';
import { checkAbilities } from '@/decorator';
import { PaginationDto } from '@/common';
import { TypeSubject } from '@/common/enums';
import { TypeAction } from '@/generated/prisma/enums';
@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) { }

  @Get()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.debt })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.debtService.findAll(paginationDto);
  }

  @Get('student/:studentId')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.debt })
  findAllByStudent(@Param('studentId') studentId: string, @Query() paginationDto: PaginationDto) {
    return this.debtService.findAllByStudent(studentId, paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.debt })
  findOne(@Param('id') id: string) {
    return this.debtService.findOne(id);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.debt })
  remove(@Param('id') id: string) {
    return this.debtService.remove(id);
  }
}
