import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CorrespondenceService } from './correspondence.service';
import { CreateCorrespondenceDto } from './dto/create-correspondence.dto';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from '@/generated/prisma/enums';
import { TypeSubject } from '@/common/enums';
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { PaginationDto } from '@/common';

@Controller('correspondence')
export class CorrespondenceController {
  constructor(private readonly correspondenceService: CorrespondenceService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.correspondence })
  create(@CurrentUser() user: JwtPayload, @Body() createCorrespondenceDto: CreateCorrespondenceDto) {
    return this.correspondenceService.create(user, createCorrespondenceDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.correspondence })
  findAll(@CurrentUser() user: JwtPayload,@Query() paginationDto: PaginationDto) {
    return this.correspondenceService.findAll(user,paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.correspondenceService.findOne(+id);
  }

}
