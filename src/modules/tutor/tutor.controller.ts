import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { PaginationDto } from '@/common';

import { checkAbilities } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from '@prisma/client';

@UseGuards(AbilitiesGuard)
@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.tutor })
  create(@Body() createTutorDto: CreateTutorDto) {
    return this.tutorService.create(createTutorDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.tutor })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.tutorService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.tutor })
  findOne(@Param('id') id: string) {
    return this.tutorService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.tutor })
  update(@Param('id') id: string, @Body() updateTutorDto: UpdateTutorDto) {
    return this.tutorService.update(id, updateTutorDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.tutor })
  remove(@Param('id') id: string) {
    return this.tutorService.remove(id);
  }
}