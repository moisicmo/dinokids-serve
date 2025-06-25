import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  imports: [PrismaModule,CaslModule],
})
export class ScheduleModule { }
