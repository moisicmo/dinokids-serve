import { Injectable } from '@nestjs/common';
import { CreateAssignmentRoomDto } from './dto/create-assignment-room.dto';
import { UpdateAssignmentRoomDto } from './dto/update-assignment-room.dto';

@Injectable()
export class AssignmentRoomService {
  create(createAssignmentRoomDto: CreateAssignmentRoomDto) {
    return 'This action adds a new assignmentRoom';
  }

  findAll() {
    return `This action returns all assignmentRoom`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assignmentRoom`;
  }

  update(id: number, updateAssignmentRoomDto: UpdateAssignmentRoomDto) {
    return `This action updates a #${id} assignmentRoom`;
  }

  remove(id: number) {
    return `This action removes a #${id} assignmentRoom`;
  }
}
