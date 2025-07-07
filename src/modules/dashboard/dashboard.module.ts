import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [PrismaModule,CaslModule],
})
export class DashboardModule { }
