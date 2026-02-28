import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult,  } from '@/common';
import { UserShortSelect, UserType, UserShortType } from '@/common/entities/user.entity';
import { Prisma } from '@/generated/prisma/client';
@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService) { }

  async findByRole(roleName: string): Promise<PaginationResult<UserShortType>> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          role: {
            name: {
              equals: roleName,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        select: UserShortSelect,
      });

      return { data: users, meta: { total: users.length, page: 1, lastPage: 1 } };
    } catch (error) {
      console.error('❌ Error en findByRole(User):', error);
      throw new InternalServerErrorException('Hubo un error al buscar usuarios por rol');
    }
  }

}