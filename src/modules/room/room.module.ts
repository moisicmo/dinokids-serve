import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { ScheduleModule } from '../schedule/schedule.module';
@Module({
  controllers: [RoomController],
  providers: [RoomService],
  imports: [PrismaModule,ScheduleModule],
})
export class RoomModule { }
