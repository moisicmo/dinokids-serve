import { Module } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [TutorController],
  providers: [TutorService],
  imports: [PrismaModule,CaslModule],
})
export class TutorModule { }
