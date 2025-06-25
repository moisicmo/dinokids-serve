import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService],
  imports: [PrismaModule,CaslModule],
})
export class TeacherModule { }
