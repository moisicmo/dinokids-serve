import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { CHECK_ABILITY, RequiredRule } from 'src/decorator/abilities.decorator';
import { ForbiddenError } from '@casl/ability';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) || [];

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // 🟨 Cargar staff y permisos
    const staff = await this.prisma.staff.findUnique({
      where: { userId: user.id },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!staff) {
      throw new ForbiddenException('No tienes un rol asignado.');
    }

    const permissions = staff.role.permissions;
    const ability = this.caslAbilityFactory.createForPermissions(user, permissions);

    for (const rule of rules) {
      try {
        ForbiddenError.from(ability)
          .setMessage('No tienes permisos suficientes')
          .throwUnlessCan(rule.action, rule.subject);
      } catch (error) {
        throw new ForbiddenException(error.message);
      }
    }

    return true;
  }
}
