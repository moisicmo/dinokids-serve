import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [PrismaModule,CaslModule],
})
export class StudentModule { }
