import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { RoleSelect, RoleType } from './entities/role.entity';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class RoleService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(email: string, createRoleDto: CreateRoleDto) {
    try {
      const { name, permissionIds } = createRoleDto;

      // 🔹 Validar duplicado de nombre
      const existingRole = await this.prisma.role.findFirst({
        where: { name },
      });

      if (existingRole) {
        throw new BadRequestException(
          `Ya existe un rol con el nombre "${name}"`,
        );
      }

      // 🔹 Validar existencia de los permisos (si se envían)
      if (permissionIds && permissionIds.length > 0) {
        const foundPermissions = await this.prisma.permission.findMany({
          where: { id: { in: permissionIds } },
          select: { id: true },
        });

        const foundIds = foundPermissions.map((p) => p.id);
        const missingIds = permissionIds.filter((id) => !foundIds.includes(id));

        if (missingIds.length > 0) {
          throw new BadRequestException(
            `Algunos permisos no existen: ${missingIds.join(', ')}`,
          );
        }
      }

      // 🔹 Crear el rol con la relación a permisos
      const newRole = await this.prisma.role.create({
        data: {
          name,
          createdBy: email,
          permissions: permissionIds?.length
            ? {
              connect: permissionIds.map((id) => ({ id })),
            }
            : undefined,
        },
        select: RoleSelect,
      });

      return newRole;
    } catch (error) {
      console.error('❌ Error en RoleService.create():', error);

      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Hubo un error al crear el rol');
    }
  }


  async findAll(
    paginationDto: PaginationDto
  ): Promise<PaginationResult<RoleType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      // 🔹 Armar el filtro final para Prisma
      const whereClause: Prisma.RoleWhereInput = {
        active: true,
        ...(keys
          ? {
            OR: [
              { name: { contains: keys, mode: Prisma.QueryMode.insensitive } },
            ],
          }
          : {}),
      };

      // 🔹 Paginación
      const total = await this.prisma.role.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      const data = await this.prisma.role.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: RoleSelect,
      });

      return { data, meta: { total, page, lastPage } };

    } catch (error) {
      console.error('❌ Error en findAll(Role):', error);

      // Manejo de errores más claro y consistente
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar roles');
    }
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with id #${id} not found`);
    }

    return role;
  }

  async update(email: string, id: string, updateRoleDto: UpdateRoleDto) {
    try {
      const { name, permissionIds } = updateRoleDto;

      // 🔹 Verificar existencia del rol
      const existingRole = await this.prisma.role.findUnique({
        where: { id },
        include: { permissions: true },
      });

      if (!existingRole) {
        throw new NotFoundException(`No se encontró el rol con ID "${id}"`);
      }

      // 🔹 Si cambia el nombre, verificar duplicado
      if (name && name !== existingRole.name) {
        const duplicate = await this.prisma.role.findFirst({ where: { name } });
        if (duplicate) {
          throw new BadRequestException(
            `Ya existe otro rol con el nombre "${name}"`,
          );
        }
      }

      // 🔹 Validar los permisos si se envían
      let connectData: any = undefined;
      let disconnectData: any = undefined;

      if (permissionIds) {
        // Buscar todos los permisos válidos
        const foundPermissions = await this.prisma.permission.findMany({
          where: { id: { in: permissionIds } },
          select: { id: true },
        });

        const foundIds = foundPermissions.map((p) => p.id);
        const missingIds = permissionIds.filter((id) => !foundIds.includes(id));

        if (missingIds.length > 0) {
          throw new BadRequestException(
            `Algunos permisos no existen: ${missingIds.join(', ')}`,
          );
        }

        // Detectar permisos a conectar / desconectar
        const currentIds = existingRole.permissions.map((p) => p.id);

        const toConnect = foundIds
          .filter((id) => !currentIds.includes(id))
          .map((id) => ({ id }));

        const toDisconnect = currentIds
          .filter((id) => !foundIds.includes(id))
          .map((id) => ({ id }));

        connectData = toConnect.length > 0 ? { connect: toConnect } : undefined;
        disconnectData =
          toDisconnect.length > 0 ? { disconnect: toDisconnect } : undefined;
      }

      // 🔹 4️⃣ Actualizar el rol
      const updatedRole = await this.prisma.role.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(connectData || disconnectData
            ? { permissions: { ...connectData, ...disconnectData } }
            : {}),
        },
        select: RoleSelect,
      });

      return updatedRole;
    } catch (error) {
      console.error('❌ Error en RoleService.update():', error);

      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Hubo un error al actualizar el rol');
    }
  }







  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        active: false,
      },
      select: RoleSelect,
    });
  }
}
