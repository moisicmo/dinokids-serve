import { Module } from '@nestjs/common';
import { AssignmentRoomService } from './assignment-room.service';
import { AssignmentRoomController } from './assignment-room.controller';

@Module({
  controllers: [AssignmentRoomController],
  providers: [AssignmentRoomService],
})
export class AssignmentRoomModule {}
