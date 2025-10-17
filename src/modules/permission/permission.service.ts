import { PaginationDto, PaginationResult } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PermissionSelect, PermissionType } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CaslFilterContext } from '@/common/extended-request';
import { ConditionOperator, Prisma, TypeAction, TypeSubject } from '@prisma/client';
import { UpdatePermissionDto } from './dto/update-permission.dto';
@Injectable()
export class PermissionService {

  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, createPermissionDto: CreatePermissionDto) {
    try {
      // 🔹 Desestructurar DTO
      const { action, subject, reason, conditions } =
        createPermissionDto;

      // 🔹 Crear permiso principal
      const permission = await this.prisma.permission.create({
        data: {
          action,
          subject,
          reason: reason ?? null,
          createdById: userId,
        },
      });

      // 🔹 Crear condiciones si existen
      if (conditions && conditions.length > 0) {
        await this.prisma.condition.createMany({
          data: conditions.map((cond) => ({
            permissionId: permission.id,
            field: cond.field,
            operator: cond.operator,
            value: cond.value,
            createdById: userId,
          })),
        });
      }

      // 🔹 Retornar permiso con sus condiciones
      const fullPermission = await this.prisma.permission.findUnique({
        where: { id: permission.id },
        include: { conditions: true },
      });

      return fullPermission;
    } catch (error) {
      console.error('❌ Error en create(Permission):', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al crear el permiso');
    }
  }



  async findAll(
    paginationDto: PaginationDto,
    caslFilter?: CaslFilterContext,
  ): Promise<PaginationResult<PermissionType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      // 🔹 Normalizamos el texto
      const searchKey = keys.trim().toLowerCase();

      // 🔹 Buscamos coincidencias en los enums
      const matchedActions = Object.values(TypeAction).filter((a) =>
        a.toLowerCase().includes(searchKey),
      );
      const matchedSubjects = Object.values(TypeSubject).filter((s) =>
        s.toLowerCase().includes(searchKey),
      );

      // 🔹 Armamos el filtro principal
      const whereClause: Prisma.PermissionWhereInput = {
        active: true,
        ...(caslFilter?.hasNoRestrictions ? {} : caslFilter?.filter ?? {}),
        ...(searchKey
          ? {
            OR: [
              { action: { in: matchedActions } },
              { subject: { in: matchedSubjects } },
              { reason: { contains: keys, mode: Prisma.QueryMode.insensitive } },
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

async update(userId: string, id: string, dto: UpdatePermissionDto) {
  try {
    const { action, subject, reason, conditions } = dto;

    const existing = await this.prisma.permission.findUnique({
      where: { id },
      include: { conditions: true },
    });

    if (!existing)
      throw new NotFoundException('El permiso especificado no existe');

    await this.prisma.permission.update({
      where: { id },
      data: {
        action,
        subject,
        reason: reason ?? existing.reason,
      },
    });

if (Array.isArray(conditions)) {
  // Eliminar condiciones anteriores
  await this.prisma.condition.deleteMany({ where: { permissionId: id } });

  // Crear nuevas (solo si son válidas)
  const validConditions = conditions.filter(
    (c): c is { field: string; operator: ConditionOperator; value: string } =>
      !!c.field && !!c.operator && !!c.value,
  );

  if (validConditions.length > 0) {
    await this.prisma.condition.createMany({
      data: validConditions.map((cond) => ({
        permissionId: id,
        field: cond.field,
        operator: cond.operator,
        value: cond.value,
        createdById: userId,
      })),
    });
  }
}


    return this.prisma.permission.findUnique({
      where: { id },
      include: { conditions: true },
    });
  } catch (error) {
    console.error('❌ Error en PermissionService.update():', error);
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException(
      'Hubo un error al actualizar el permiso',
    );
  }
}

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.permission.update({
      where: { id },
      data: {
        active: false,
      },
      select: PermissionSelect,
    });
  }

}
