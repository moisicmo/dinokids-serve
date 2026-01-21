import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser, RequestInfo } from '@/decorator';
import { TypeAction } from "@/generated/prisma/client";
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/enums';
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.room })
  create(@CurrentUser() user: JwtPayload, @Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(user.email, createRoomDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.room })
  findAll(@Query() paginationDto: PaginationDto, @RequestInfo() requestInfo: RequestInfo) {
    return this.roomService.findAll(paginationDto, requestInfo.branchSelect);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.room })
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.room })
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(user.email, id, updateRoomDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.room })
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}

