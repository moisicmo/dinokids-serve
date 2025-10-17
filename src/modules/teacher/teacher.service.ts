import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserEntity } from '@/common';
import { TeacherSelect, TeacherType } from './entities/teacher.entity';
import { Prisma } from '@prisma/client';
import { CaslFilterContext } from '@/common/extended-request';
@Injectable()

export class TeacherService {

  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, createTeacherDto: CreateTeacherDto) {
    const { cityId, zone, detail, major, academicStatus, startJob, brancheIds, ...userDto } = createTeacherDto;

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
        address: {
          create: {
            cityId,
            zone,
            detail,
            createdById: userId,
          }
        },
        teacher: {
          create: {
            major,
            academicStatus,
            startJob,
            branches: {
              connect: brancheIds.map(id => ({ id })),
            },
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
): Promise<PaginationResult<TeacherType>> {
  try {
    const { page = 1, limit = 10, keys = '' } = paginationDto;
    console.log('🎯 CASL filter recibido:', JSON.stringify(caslFilter, null, 2));

    // 🧠 Construcción del filtro por sucursal (branch)
    let branchFilter: Prisma.TeacherWhereInput = {};
    if (caslFilter?.filter?.OR) {
      const branchCondition = caslFilter.filter.OR.find((cond: any) => cond.id?.in);
      if (branchCondition) {
        branchFilter = {
          branches: {
            some: {
              id: { in: branchCondition.id.in }, // ✅ el array que viene en CASL
            },
          },
        };
      }
    }

    // 🔹 Armar el filtro final para Prisma
    const whereClause: Prisma.TeacherWhereInput = {
      active: true,
      ...(caslFilter?.hasNoRestrictions ? {} : branchFilter),
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

    console.log('🧩 Filtro final StaffWhereInput:', JSON.stringify(whereClause, null, 2));

    // 🔹 Paginación
    const total = await this.prisma.teacher.count({ where: whereClause });
    const lastPage = Math.ceil(total / limit);

    const data = await this.prisma.teacher.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      select: TeacherSelect,
    });

    return { data, meta: { total, page, lastPage } };

  } catch (error) {
    console.error('❌ Error en findAll(Teacher):', error);
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException('Hubo un error al listar profesores');
  }
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
    const { cityId, zone, detail, major, academicStatus, startJob, brancheIds, ...userDto } = updateTeacherDto;

    return this.prisma.user.update({
      where: {
        id,
        teacher: {
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
        teacher: {
          update: {
            where: { userId: id },
            data: {
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