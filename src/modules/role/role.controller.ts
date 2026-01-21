import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from "@/generated/prisma/client";
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/enums';
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.role })
  create(@CurrentUser() user: JwtPayload, @Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(user.email, createRoleDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.role })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.roleService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.role })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.role })
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(user.email, id, updateRoleDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.role })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}

