import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PermissionService } from '@/modules/permission/permission.service';
@Module({
  controllers: [RoleController],
  providers: [RoleService,PermissionService],
  imports: [PrismaModule],
})
export class RoleModule { }
