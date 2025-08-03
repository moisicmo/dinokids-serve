import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { subject } from '@casl/ability';          // 👈 nuevo import
import { PrismaService } from 'src/prisma/prisma.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { CHECK_ABILITY, RequiredRule } from 'src/decorator/abilities.decorator';
import { ForbiddenError } from '@casl/ability';
import { StaffSelect } from '@/modules/staff/entities/staff.entity';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('can activate');

    const rules =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const staff = await this.prisma.staff.findUnique({
      where: { userId: user.id },
      select: StaffSelect,
    });

    if (!staff) {
      throw new ForbiddenException('No tienes un rol asignado.');
    }

    const permissions = staff.role.permissions;
    const ability = this.caslAbilityFactory.createForPermissions(
      staff,
      permissions,
    );

    console.log('ability', JSON.stringify(ability.rules));

    for (const rule of rules) {
      try {
        let subjectToCheck: any = rule.subject;

        // Si la acción requiere una entidad específica (update/delete/read con :id)
        if (['update', 'delete', 'read'].includes(rule.action)) {
          const resourceId = req.params.id;

          if (resourceId && typeof rule.subject === 'string') {
            if (rule.subject === 'branch') {
              // 1. Traemos la entidad
              const entity = await this.prisma.branch.findUnique({
                where: { id: resourceId },
              });

              if (!entity) {
                throw new ForbiddenException('Recurso no encontrado');
              }

              // 2. Envolvemos con subject para que CASL-Prisma la reconozca
              subjectToCheck = subject('branch', entity);
            }
          }
        }

        console.log(
          'CASL chequeando:',
          rule.action,
          rule.subject,
          subjectToCheck,
          ability.rules,
        );

        ForbiddenError.from(ability)
          .setMessage('No tienes permisos suficientes')
          .throwUnlessCan(rule.action, subjectToCheck);
      } catch (error) {
        throw new ForbiddenException(error.message);
      }
    }

    return true;
  }
}