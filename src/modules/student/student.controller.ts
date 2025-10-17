import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from '@/common';

import { checkAbilities, CurrentUser } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from '@prisma/client';
import { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { AuthenticatedRequest } from '@/common/extended-request';

@UseGuards(AbilitiesGuard)
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.student })
  create(@CurrentUser() user: JwtPayload, @Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(user.id, createStudentDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.student })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.studentService.findAll(paginationDto, req.caslFilter);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.student })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.student })
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(user.id, id, updateStudentDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.student })
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }
}