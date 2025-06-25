import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [StaffController],
  providers: [StaffService],
  imports: [PrismaModule,CaslModule],
})
export class StaffModule { }
