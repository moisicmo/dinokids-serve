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

  @Get('sent')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.correspondence })
  findSent(@CurrentUser() user: JwtPayload, @Query() paginationDto: PaginationDto) {
    return this.correspondenceService.findSent(user, paginationDto);
  }

  @Get('sent/all')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.sentCorrespondenceAll })
  findAllSent(@Query() paginationDto: PaginationDto) {
    return this.correspondenceService.findAllSent(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.correspondence })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.correspondenceService.findOne(id, user.id);
  }

}
