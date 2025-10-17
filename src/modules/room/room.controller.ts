import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";
import { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { AuthenticatedRequest } from '@/common/extended-request';

@UseGuards(AbilitiesGuard)
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.room })
  create(@CurrentUser() user: JwtPayload, @Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(user.id, createRoomDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.room })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.roomService.findAll(paginationDto, req.caslFilter);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.room })
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.room })
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(user.id, id, updateRoomDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.room })
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}

