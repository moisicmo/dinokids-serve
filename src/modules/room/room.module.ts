import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { ScheduleModule } from '../schedule/schedule.module';
@Module({
  controllers: [RoomController],
  providers: [RoomService],
  imports: [PrismaModule,CaslModule,ScheduleModule],
})
export class RoomModule { }
