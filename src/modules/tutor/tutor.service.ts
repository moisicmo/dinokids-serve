import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserEntity } from '@/common'; import { TutorSelect, TutorType } from './entities/tutor.entity';
import { Prisma } from '@prisma/client';
import { CaslFilterContext } from '@/common/extended-request';
import { cleanCaslFilterForModel } from '@/common/casl.util';
@Injectable()

export class TutorService {

  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, createTutorDto: CreateTutorDto) {
    const { cityId, zone, detail, ...userDto } = createTutorDto;

    const userExists = await this.prisma.user.findUnique({
      where: { numberDocument: userDto.numberDocument },
      select: UserEntity,
    });

    if (userExists) {
      throw new ConflictException('El usuario ya existe');
    }


    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userDto.email ?? 'withoutpassword', salt);

    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        address: {
          create: {
            cityId,
            zone,
            detail,
            createdById: userId,
          }
        },
        tutor: {
          create: {
            createdById: userId,
          },
        },
        ...userDto,
      },
      select: UserEntity,
    });
  }

  async findAll(
    paginationDto: PaginationDto,
    caslFilter?: CaslFilterContext,
  ): Promise<PaginationResult<TutorType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const shouldIgnoreCasl =
        caslFilter?.subject === 'student' || caslFilter?.subject === 'tutor';

      const cleanedFilter = cleanCaslFilterForModel(caslFilter?.filter, 'student');


      const whereClause: Prisma.TutorWhereInput = {
        active: true,
        ...(caslFilter?.hasNoRestrictions || shouldIgnoreCasl ? {} : cleanedFilter ?? {}),
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
      select: UserEntity,
    });

    if (!user) {
      throw new NotFoundException(`Tutor with id #${id} not found`);
    }

    return user;
  }

  async update(id: string, updateTutorDto: UpdateTutorDto) {
    await this.findOne(id);
    const { cityId, zone, detail, ...userDto } = updateTutorDto;

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
            cityId,
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