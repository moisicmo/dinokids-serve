import { Body, Controller, Get, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PaginationDto } from '@/common';
import { checkAbilities } from '@/decorator';
import { TypeAction } from "@/generated/prisma/client";
import { TypeSubject } from '@/common/subjects';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.permission })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permissionService.findAll(paginationDto);
  }

}
