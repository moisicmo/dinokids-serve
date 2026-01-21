import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserSelect } from '@/common'; import { TutorSelect, TutorType } from './entities/tutor.entity';
import { Prisma } from '@/generated/prisma/client';
@Injectable()

export class TutorService {

  constructor(private readonly prisma: PrismaService) { }

  async create(email: string, createTutorDto: CreateTutorDto) {
    const { city, zone, detail, ...userDto } = createTutorDto;

    const userExists = await this.prisma.user.findUnique({
      where: { numberDocument: userDto.numberDocument },
      select: UserSelect,
    });

    if (userExists) {
      throw new ConflictException('El usuario ya existe');
    }


    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userDto.email ?? 'withoutpassword', salt);

    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        createdBy: email,
        address: {
          create: {
            city,
            zone,
            detail,
            createdBy: email,
          }
        },
        tutor: {
          create: {
            createdBy: email,
          },
        },
        ...userDto,
      },
      select: UserSelect,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<TutorType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: Prisma.TutorWhereInput = {
        active: true,
        ...(keys
          ? {
            user: {
              OR: [
                { name: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                { lastName: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                { numberDocument: { contains: keys, mode: Prisma.QueryMode.insensitive } },
              ],
            },
          }
          : {}),
      };
      // 🔹 Paginación
      const total = await this.prisma.tutor.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);
      const data = await this.prisma.tutor.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: TutorSelect,
      });

      return { data, meta: { total, page, lastPage } };

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Hubo un error al pedir tutores');
    }
  }



  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        tutor: {
          isNot: null,
        },
      },
      select: UserSelect,
    });

    if (!user) {
      throw new NotFoundException(`Tutor with id #${id} not found`);
    }

    return user;
  }

  async update(id: string, updateTutorDto: UpdateTutorDto) {
    await this.findOne(id);
    const { city, zone, detail, ...userDto } = updateTutorDto;

    return this.prisma.user.update({
      where: {
        id,
        tutor: {
          isNot: null,
        },
      },
      data: {
        address: {
          update: {
            city,
            zone,
            detail,
          }
        },
        tutor: {
          update: {
            where: { userId: id },
            data: {

            },
          },
        },
        ...userDto,
      },
      select: UserSelect,
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
      select: UserSelect,
    });
  }
}