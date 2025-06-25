import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PaginationDto } from '@/common';
import { checkAbilities } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";

@UseGuards(AbilitiesGuard)
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }
  
  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.permission })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permissionService.findAll(paginationDto);
  }
}
