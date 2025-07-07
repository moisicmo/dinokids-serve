import { PaginationDto, PaginationResult } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PermissionSelect, PermissionType } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
@Injectable()
export class PermissionService {

  constructor(private readonly prisma: PrismaService) { }

  async create(roleId: string, createPermissionDto: CreatePermissionDto) {
    return await this.prisma.permission.create({
      data: {
        ...createPermissionDto,
        roleId,
      },
      select: PermissionSelect
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<PermissionType>>  {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: any = {
        active: true,
      };

      if (keys.trim() !== '') {
        whereClause.OR = [
          { action: { contains: keys, mode: 'insensitive' } },
          { subject: { contains: keys, mode: 'insensitive' } },
          { reason: { contains: keys, mode: 'insensitive' } },
        ];
      }
      const totalPages = await this.prisma.permission.count({
        where: whereClause,
      });
      const lastPage = Math.ceil(totalPages / limit);
      return {
        data: await this.prisma.branch.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereClause,
          orderBy: {
            createdAt: 'asc',
          },
          select: PermissionSelect,
        }),
        meta: { total: totalPages, page, lastPage },
      };

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Hubo un error al pedir permisos');
    }
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      select: PermissionSelect,
    });

    if (!permission) {
      throw new NotFoundException(`Permission with id #${id} not found`);
    }

    return permission;
  }
}
