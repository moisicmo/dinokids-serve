import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService],
  imports: [PrismaModule,CaslModule],
})
export class PermissionModule { }
