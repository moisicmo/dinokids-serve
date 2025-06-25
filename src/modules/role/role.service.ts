import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { RoleEntity } from './entities/role.entity';
import { PermissionService } from '@/modules/permission/permission.service';
@Injectable()
export class RoleService {

  constructor(
    private readonly prisma: PrismaService,
    private permissionService: PermissionService,
  ) { }

  async create(createRoleDto: CreateRoleDto) {
    try {
      const { name, permissions } = createRoleDto;

      const role = await this.prisma.role.create({
        data: { name },
      });

      for (const permission of permissions) {
        await this.permissionService.create(role.id, {
          ...permission,
        });
      }

      return this.findOne(role.id);
    } catch (error) {
      throw new Error(`No se pudo crear el rol: ${error.message}`);
    }
  }



  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.role.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.role.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { active: true },
        select: RoleEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
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

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { name, permissions } = updateRoleDto;

    await this.findOne(id);

    if (!permissions || permissions.length === 0) {
      return this.prisma.role.update({
        where: { id },
        data: { name },
        select: RoleEntity,
      });
    }
    const updatedPermissions: { id: string }[] = [];

    for (const perm of permissions) {
      let permissionToAssign: { id: string };

      if (perm.conditions && perm.id) {
        const basePerm = await this.permissionService.findOne(perm.id);
        if (!basePerm) {
          throw new NotFoundException(`Permission with id #${perm.id} not found`);
        }

        const newPerm = await this.permissionService.create(id, {
          ...basePerm,
          conditions: perm.conditions,
        });

        permissionToAssign = { id: newPerm.id };
      } else if (perm.id) {
        permissionToAssign = { id: perm.id };
      } else {
        throw new BadRequestException('Permission must have an ID to be assigned or updated');
      }

      updatedPermissions.push(permissionToAssign);
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: {
          set: updatedPermissions,
        },
      },
      select: RoleEntity,
    });
  }




  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        active: false,
      },
      select: RoleEntity,
    });
  }
}
