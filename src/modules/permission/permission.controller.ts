import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@UseGuards(AbilitiesGuard)
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.permission })
  create(@CurrentUser() user: JwtPayload, @Body() createRoleDto: CreatePermissionDto) {
    return this.permissionService.create(user.id, createRoleDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.permission })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permissionService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.permission })
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.permission })
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() updateRoleDto: UpdatePermissionDto) {
    return this.permissionService.update(user.id, id, updateRoleDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.permission })
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }

}
