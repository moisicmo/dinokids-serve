import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
@Module({
  controllers: [BranchController],
  providers: [BranchService],
  imports: [PrismaModule,CaslModule],
})
export class BranchModule { }
