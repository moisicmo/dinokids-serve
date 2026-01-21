import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser, RequestInfo } from '@/decorator';
import { TypeAction } from "@/generated/prisma/client";
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/enums';
@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.branch })
  create(@CurrentUser() user: JwtPayload, @Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(user.email, createBranchDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.branch })
  findAll( @Query() paginationDto: PaginationDto, @RequestInfo() requestInfo: RequestInfo ) {
    return this.branchService.findAll(paginationDto, requestInfo.branchSelect);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.branch })
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.branch })
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.branch })
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
}

