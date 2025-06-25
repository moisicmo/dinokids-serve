import { Module } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { SpecialtyController } from './specialty.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
@Module({
  controllers: [SpecialtyController],
  providers: [SpecialtyService],
  imports: [PrismaModule,CaslModule],
})
export class SpecialtyModule { }
