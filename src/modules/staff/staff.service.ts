import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserEntity } from '@/common';import { StaffSelect, StaffType } from './entities/staff.entity';
 @Injectable()
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

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<StaffType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: any = {
        active: true,
      };

      if (keys.trim() !== '') {
        whereClause.OR = [
          {
            user: {
              OR: [
                { name: { contains: keys, mode: 'insensitive' } },
                { lastName: { contains: keys, mode: 'insensitive' } },
                { email: { contains: keys, mode: 'insensitive' } },
                { numberDocument: { contains: keys, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }
      const totalPages = await this.prisma.staff.count({
        where: whereClause,
      });
      const lastPage = Math.ceil(totalPages / limit);
      return {
        data: await this.prisma.staff.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereClause,
          orderBy: {
            createdAt: 'asc',
          },
          select: StaffSelect,
        }),
        meta: { total: totalPages, page, lastPage },
      };

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Hubo un error al pedir staff');
    }
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