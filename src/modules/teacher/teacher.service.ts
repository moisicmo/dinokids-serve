import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, UserEntity } from '@/common'; @Injectable()

export class TeacherService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createTeacherDto: CreateTeacherDto) {
    const { zone, address, major, academicStatus, startJob, brancheIds, ...userDto } = createTeacherDto;

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
        password: hashedPassword,
        teacher: {
          create: {
            zone,
            address,
            major,
            academicStatus,
            startJob,
            branches: {
              connect: brancheIds.map(id => ({ id })),
            }
          },
        },
        ...userDto,
      },
      select: UserEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.user.count({
      where: {
        teacher: {
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
          teacher: {
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
        teacher: {
          isNot: null,
        },
      },
      select: UserEntity,
    });

    if (!user) {
      throw new NotFoundException(`Teacher with id #${id} not found`);
    }

    return user;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    await this.findOne(id);
    const { zone, address, major, academicStatus, startJob, brancheIds, ...userDto } = updateTeacherDto;

    return this.prisma.user.update({
      where: {
        id,
        teacher: {
          isNot: null,
        },
      },
      data: {
        teacher: {
          update: {
            where: { userId: id },
            data: {
              zone,
              address,
              major,
              academicStatus,
              startJob,
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
        teacher: {
          isNot: null,
        },
      },
      data: {
        teacher: {
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