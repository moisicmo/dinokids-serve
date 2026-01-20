import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserEntity } from '@/common';
import { StaffSelect, StaffType } from './entities/staff.entity';
import { Prisma } from '@/generated/prisma/client';
@Injectable()
export class StaffService {

  constructor(private readonly prisma: PrismaService) { }

  async create(email: string, createStaffDto: CreateStaffDto) {
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
            createdBy: email,
            branches: {
              connect: brancheIds.map(id => ({ id })),
            }
          },
        },
      },
      select: UserEntity,
    });
  }

async findAll( paginationDto: PaginationDto): Promise<PaginationResult<StaffType>> {
  try {
    const { page = 1, limit = 10, keys = '' } = paginationDto;

    // 🔹 Armar el filtro final para Prisma
    const whereClause: Prisma.StaffWhereInput = {
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

    console.log('🧩 Filtro final StaffWhereInput:', JSON.stringify(whereClause, null, 2));

    // 🔹 Paginación
    const total = await this.prisma.staff.count({ where: whereClause });
    const lastPage = Math.ceil(total / limit);

    const data = await this.prisma.staff.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      select: StaffSelect,
    });

    return { data, meta: { total, page, lastPage } };

  } catch (error) {
    console.error('❌ Error en findAll(Staff):', error);
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException('Hubo un error al listar staffs');
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
    try {
      await this.findOne(id);
      const { roleId, brancheIds, ...userDto } = updateStaffDto;
  
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
      
    } catch (error) {
      console.error('❌ Error en findAll(Staff):', error);

      // Manejo de errores más claro y consistente
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar staffs');
    }
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