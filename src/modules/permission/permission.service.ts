import { PaginationDto, PaginationResult } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PermissionSelect, PermissionType } from './entities/permission.entity';
import { Prisma, TypeAction } from '@/generated/prisma/client';
@Injectable()
export class PermissionService {

  constructor(private readonly prisma: PrismaService) { }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<PermissionType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      // 🔹 Normalizamos el texto
      const searchKey = keys.trim().toLowerCase();

      // 🔹 Buscamos coincidencias en los enums
      const matchedActions = Object.values(TypeAction).filter((a) =>
        a.toLowerCase().includes(searchKey),
      );

      // 🔹 Armamos el filtro principal
      const whereClause: Prisma.PermissionWhereInput = {
        active: true,
        ...(searchKey
          ? {
            OR: [
              { action: { in: matchedActions } },
            ],
          }
          : {}),
      };

      const total = await this.prisma.permission.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      const data = await this.prisma.permission.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: PermissionSelect,
      });

      return { data, meta: { total, page, lastPage } };
    } catch (error) {
      console.error('❌ Error en findAll(Permission):', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar permisos');
    }
  }

}
