import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssignmentRoomService } from './assignment-room.service';
import { CreateAssignmentRoomDto } from './dto/create-assignment-room.dto';
import { UpdateAssignmentRoomDto } from './dto/update-assignment-room.dto';

@Controller('assignment-room')
export class AssignmentRoomController {
  constructor(private readonly assignmentRoomService: AssignmentRoomService) {}

  @Post()
  create(@Body() createAssignmentRoomDto: CreateAssignmentRoomDto) {
    return this.assignmentRoomService.create(createAssignmentRoomDto);
  }

  @Get()
  findAll() {
    return this.assignmentRoomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentRoomService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssignmentRoomDto: UpdateAssignmentRoomDto) {
    return this.assignmentRoomService.update(+id, updateAssignmentRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assignmentRoomService.remove(+id);
  }
}
