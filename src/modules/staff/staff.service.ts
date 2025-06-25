import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, UserEntity } from '@/common'; @Injectable()
export class StaffService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createStaffDto: CreateStaffDto) {
    const { roleId, brancheIds, ...userDto } = createStaffDto;

    const userExists = await this.prisma.user.findUnique({
      where: { numberDocument: userDto.numberDocument },
      select: UserEntity,
    });

    if (userExists) {
      throw new Error('El usuario ya existe');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userDto.email, salt);

    return await this.prisma.user.create({
      data: {
        ...userDto,
        password: hashedPassword,
        staff: {
          create: {
            roleId: roleId,
            branches: {
              connect: brancheIds.map(id => ({ id })),
            }
          },
        },
      },
      select: UserEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.user.count({
      where: {
        staff: {
          // isNot: null,
          active: true,
        },
      },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          staff: {
            // isNot: null,
            active: true,
          },
        },
        select: UserEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        staff: {
          isNot: null,
        },
      },
      select: UserEntity,
    });

    if (!user) {
      throw new NotFoundException(`Staff with id #${id} not found`);
    }

    return user;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    await this.findOne(id);
    const {  roleId, brancheIds, ...userDto } = updateStaffDto;

    return this.prisma.user.update({
      where: {
        id,
        staff: {
          isNot: null,
        },
      },
      data: {
        staff: {
          update: {
            where: { userId: id },
            data: {
              roleId,
              branches: {
                set: brancheIds?.map(id => ({ id })) ?? [],
              },
            },
          },
        },
        ...userDto,
      },
      select: UserEntity,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.user.update({
      where: {
        id,
        staff: {
          isNot: null,
        },
      },
      data: {
        staff: {
          update: {
            where: { userId: id },
            data: {
              active: false,
            },
          },
        },
      },
      select: UserEntity,
    });
  }
}