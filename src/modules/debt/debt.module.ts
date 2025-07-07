import { Module } from '@nestjs/common';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [DebtController],
  providers: [DebtService],
  imports: [PrismaModule, CaslModule],
   exports: [DebtService]
})
export class DebtModule {}
