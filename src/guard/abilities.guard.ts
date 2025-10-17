import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError, subject } from '@casl/ability';
import { PrismaService } from '@/prisma/prisma.service';
import { CaslAbilityFactory } from '@/casl/casl-ability.factory';
import { CHECK_ABILITY, RequiredRule } from '@/decorator/abilities.decorator';
import { StaffSelect } from '@/modules/staff/entities/staff.entity';
import { TypeSubject } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import { isCaslFilterEmpty } from '@/common/casl.util';


@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Reglas definidas en el decorador @checkAbilities
    const rules =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ??
      [];

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // 🔹 Buscar el staff asociado al usuario autenticado
    const staff = await this.prisma.staff.findUnique({
      where: { userId: user.id },
      select: StaffSelect,
    });

    if (!staff) throw new ForbiddenException('No es un staff válido.');
    if (!staff.role) throw new ForbiddenException('No tienes un rol asignado.');

    // 🔹 Crear la habilidad CASL para este staff
    const ability = this.caslAbilityFactory.createForPermissions(
      staff,
      staff.role.permissions,
    );

    // 🔹 Verificar cada regla requerida por el endpoint
    for (const rule of rules) {
      const { action, subject: subjectEnum } = rule;
      const resourceId = req.params?.id;

      // 🔸 1️⃣ Verificación general sin ID
      if (!resourceId) {
        if (!ability.can(action, subjectEnum)) {
          throw new ForbiddenException(
            `No tienes permisos para ${action} en ${subjectEnum}`,
          );
        }

        // ✅ Solo generar filtro CASL si la acción es de lectura o gestión
        if (['read', 'manage'].includes(action)) {
          try {
            const subjectKey = subjectEnum.toString().toLowerCase();
            const caslFilter = (accessibleBy(ability) as any)[subjectKey];

            req.caslFilter = {
              subject: subjectKey,
              filter: caslFilter,
              hasNoRestrictions: isCaslFilterEmpty(caslFilter),
            };
          } catch (err) {
            console.log(`err: ${err}`);
            // Si CASL no puede generar filtro (porque no hay permiso read), no rompas la ejecución
            req.caslFilter = { hasNoRestrictions: true, filter: {} };
          }
        } else {
          // Para create, update, delete, etc., no usamos filters
          req.caslFilter = { hasNoRestrictions: true, filter: {} };
        }

        continue;
      }

      // 🔸 2️⃣ Con ID, verifica condiciones específicas (ej. update/delete uno en particular)
      const entity = await this.loadEntity(subjectEnum, resourceId);
      if (!entity) throw new ForbiddenException('Recurso no encontrado.');

      try {
        ForbiddenError.from(ability)
          .setMessage(`No puedes ${action} este recurso de tipo ${subjectEnum}`)
          .throwUnlessCan(action, subject(subjectEnum, entity));
      } catch (err) {
        throw new ForbiddenException(err.message);
      }
    }


    return true;
  }

  // 🔹 Carga dinámica del recurso según el TypeSubject (usa el nombre exacto del modelo Prisma)
private async loadEntity(subjectType: TypeSubject, id: string) {
  const modelKey = subjectType.toLowerCase();
  const repo = (this.prisma as any)[modelKey];

  if (!repo || typeof repo.findUnique !== 'function') {
    console.warn(`[AbilitiesGuard] ⚠️ Modelo no encontrado en Prisma: ${modelKey}`);
    return null;
  }

  // 🔹 Mapa de claves primarias personalizadas
  const primaryKeyMap: Record<string, string> = {
    staff: 'userId',
    user: 'id',
    role: 'id',
    permission: 'id',
    condition: 'id',
    student: 'id',
    teacher: 'id',
    tutor: 'id',
    branch: 'id',
    booking: 'id',
    payment: 'id',
    room: 'id',
    // agrega más si tienes modelos con PK distintas
  };

  const primaryKeyField = primaryKeyMap[modelKey] ?? 'id';

  try {
    console.log(`🔍 Buscando ${modelKey} usando PK "${primaryKeyField}" con valor ${id}`);

    const entity = await repo.findUnique({
      where: { [primaryKeyField]: id },
    });

    if (!entity) {
      console.warn(`[AbilitiesGuard] ⚠️ Entidad no encontrada (${modelKey}:${id})`);
    }

    return entity;
  } catch (err) {
    console.error(`[AbilitiesGuard] ⚠️ Error al buscar entidad ${modelKey}:`, err);
    return null;
  }
}


}
