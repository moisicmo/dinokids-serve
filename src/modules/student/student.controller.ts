import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from '@/common';

import { checkAbilities, CurrentUser } from '@/decorator';
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.student })
  create(@CurrentUser() user: JwtPayload, @Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(user.email, createStudentDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.student })
  findAll( @Query() paginationDto: PaginationDto) {
    return this.studentService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.student })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.student })
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(user.email, id, updateStudentDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.student })
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }
}