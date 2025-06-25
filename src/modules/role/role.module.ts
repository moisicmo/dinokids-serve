import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { PermissionService } from '@/modules/permission/permission.service';
@Module({
  controllers: [RoleController],
  providers: [RoleService,PermissionService],
  imports: [PrismaModule,CaslModule],
})
export class RoleModule { }
