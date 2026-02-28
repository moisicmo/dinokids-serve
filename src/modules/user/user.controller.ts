import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginationDto } from '@/common';
import { UserService } from './user.service';
import { checkAbilities } from '@/decorator';
import { TypeSubject } from '@/common/enums';
import { TypeAction } from '@/generated/prisma/enums';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('by-role/:role')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.user })
  getByRole(@Param('role') role: string) {
    return this.userService.findByRole(role);
  }

}