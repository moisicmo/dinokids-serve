import { Controller, Get, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { DebtService } from './debt.service';
import { checkAbilities } from '@/decorator';
import { TypeAction, TypeSubject } from '@prisma/client';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { PaginationDto } from '@/common';
import { AuthenticatedRequest } from '@/common/extended-request';

@UseGuards(AbilitiesGuard)
@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Get()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.debtService.findAll(paginationDto,req.caslFilter);
  }

  @Get('student/:studentId')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.inscription })
  findAllByStudent(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.debtService.findAllByStudent(studentId,paginationDto,req.caslFilter);
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
