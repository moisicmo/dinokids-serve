import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, UserEntity } from '@/common'; import { TutorEntity } from './entities/tutor.entity';
@Injectable()

export class TutorService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createTutorDto: CreateTutorDto) {
    const { city, zone, address, ...userDto } = createTutorDto;

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
        tutor: {
          create: {
            city,
            zone,
            address,
          },
        },
        ...userDto,
      },
      select: UserEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.tutor.count({
      where: {
        active: true,
      },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.tutor.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          active: true,
        },
        select: TutorEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        tutor: {
          isNot: null,
        },
      },
      select: UserEntity,
    });

    if (!user) {
      throw new NotFoundException(`Tutor with id #${id} not found`);
    }

    return user;
  }

  async update(id: string, updateTutorDto: UpdateTutorDto) {
    await this.findOne(id);
    const { city, zone, address, ...userDto } = updateTutorDto;

    return this.prisma.user.update({
      where: {
        id,
        tutor: {
          isNot: null,
        },
      },
      data: {
        tutor: {
          update: {
            where: { userId: id },
            data: {
              city,
              zone,
              address,
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
        tutor: {
          isNot: null,
        },
      },
      data: {
        tutor: {
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