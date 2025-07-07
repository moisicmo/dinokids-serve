import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserEntity } from '@/common'; import { TutorSelect, TutorType } from './entities/tutor.entity';
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
      throw new ConflictException('El usuario ya existe');
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

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<TutorType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: any = {
        active: true,
      };

      if (keys.trim() !== '') {
        whereClause.OR = [
          { city: { contains: keys, mode: 'insensitive' } },
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
      const totalPages = await this.prisma.tutor.count({
        where: whereClause,
      });
      const lastPage = Math.ceil(totalPages / limit);
      return {
        data: await this.prisma.tutor.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereClause,
          orderBy: {
            createdAt: 'asc',
          },
          select: TutorSelect,
        }),
        meta: { total: totalPages, page, lastPage },
      };

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