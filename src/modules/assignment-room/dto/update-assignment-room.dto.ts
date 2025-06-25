import { PartialType } from '@nestjs/swagger';
import { CreateAssignmentRoomDto } from './create-assignment-room.dto';

export class UpdateAssignmentRoomDto extends PartialType(CreateAssignmentRoomDto) {}
