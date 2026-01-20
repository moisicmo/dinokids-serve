import { Module } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { SpecialtyController } from './specialty.controller';
import { PrismaModule } from '@/prisma/prisma.module';
@Module({
  controllers: [SpecialtyController],
  providers: [SpecialtyService],
  imports: [PrismaModule],
})
export class SpecialtyModule { }
