import { Injectable } from '@nestjs/common';
import { PrismaAbility, createPrismaAbility } from '@casl/prisma';
import { TypeAction, TypeSubject, Condition } from '@prisma/client';
import { PermissionType } from '@/modules/permission/entities/permission.entity';
import { StaffType } from '@/modules/staff/entities/staff.entity';

// Definimos el tipo de habilidad que se usará con CASL y Prisma
export type AppAbility = PrismaAbility<[TypeAction, TypeSubject]>;

@Injectable()
export class CaslAbilityFactory {
  // Crea las habilidades (permissions) a partir de los permisos que tiene el usuario
  createForPermissions(staff: StaffType, permissions: PermissionType[]): AppAbility {
    console.log('staff', JSON.stringify(staff)); // Imprime el usuario actual
    console.log('permissions', JSON.stringify(permissions)); // Imprime los permisos recibidos

    const branchIds = staff.branches.map((b) => b.id);

    // Creamos las reglas CASL a partir de los permisos
    const rules = permissions.map((perm) => {
      const rule: any = {
        action: perm.action,
        subject: perm.subject,
        inverted: perm.inverted,
        reason: perm.reason,
      };
      

      // Si tiene condiciones, las convertimos a objeto
      if (perm.conditions && perm.conditions.length > 0) {
        rule.conditions = this.buildConditionObject(perm.conditions, {
          ...staff.user,
          branchIds, // 👉 le pasamos los branchIds al parser de condiciones
        });
      }

      return rule;
    });

    // Retorna una instancia de CASL con las reglas creadas
    return createPrismaAbility<AppAbility>(rules);
  }

  // Construye un objeto de condiciones que CASL pueda entender
  private buildConditionObject(
    conditions: Condition[],
    context: { id: string; branchIds?: string[] }
  ): any {
    const conditionObject: any = {};

    for (const cond of conditions) {
      let value: any = cond.value;

      // Reemplazo de variables dinámicas
      if (typeof value === 'string' && value.trim().replaceAll(' ', '') === '{{branchIds}}') {
        console.log('Reemplazando {{branchIds}} con:', context.branchIds);
        value = context.branchIds;
      } else if (typeof value === 'string' && value.includes('{{id}}')) {
        value = value.replace(/{{\s*id\s*}}/g, context.id);
        try {
          value = JSON.parse(value);
        } catch (_) {
          // mantener como string
        }
      }

      const operatorMap: Record<string, string> = {
        equals: 'equals',
        not_equals: 'not',
        in: 'in',           // ← clave
        not_in: 'notIn',
        greater_than: 'gt',
        greater_than_or_equal: 'gte',
        less_than: 'lt',
        less_than_or_equal: 'lte',
        contains: 'contains',
        starts_with: 'startsWith',
        ends_with: 'endsWith',
        exists: 'isSet',
      };

      const op = operatorMap[cond.operator];
      if (!op) continue;

      if (!conditionObject[cond.field]) {
        conditionObject[cond.field] = {};
      }

      conditionObject[cond.field][op] = value;
    }

    console.log('🔍 Condiciones finales para CASL:', conditionObject);

    return conditionObject;
  }

}
