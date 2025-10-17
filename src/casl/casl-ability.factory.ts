import { Injectable } from '@nestjs/common';
import { PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { TypeAction, TypeSubject, Condition } from '@prisma/client';
import { PermissionType } from '@/modules/permission/entities/permission.entity';
import { StaffType } from '@/modules/staff/entities/staff.entity';
import { RawRuleOf } from '@casl/ability';

// 🔹 Definimos los Subjects válidos desde tu enum
type AppSubjects = Subjects<Record<TypeSubject, any>>;

// 🔹 Tipo de habilidad global
export type AppAbility = PureAbility<[TypeAction, AppSubjects], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
  createForPermissions(
    staff: StaffType,
    permissions: PermissionType[],
  ): AppAbility {
    const context = {
      userId: staff.userId,
      branchIds: staff.branches?.map((b) => b.id) ?? [],
      roleId: staff.role.id,
      currentYear: new Date().getFullYear(),
      currentHour: new Date().getHours(),
    };

    const rules: RawRuleOf<AppAbility>[] = [];

    for (const perm of permissions) {
      const isDynamicConditionValid = this.evaluateDynamicConditions(
        perm.conditions,
        context,
      );
      if (!isDynamicConditionValid) continue;

      const rule: RawRuleOf<AppAbility> = {
        action: perm.action,
        subject: perm.subject,
        inverted: perm.inverted,
        reason: perm.reason ?? undefined,
        conditions: this.parseStaticConditions(perm.conditions, context),
      };

      rules.push(rule);
    }

    console.log('🎯 Reglas generadas:', JSON.stringify(rules, null, 2));

    return createPrismaAbility<AppAbility>(rules);
  }

  private evaluateDynamicConditions(
    conds: Condition[],
    context: Record<string, any>,
  ): boolean {
    for (const cond of conds) {
      const field = cond.field;
      const value = this.parseValue(cond.value, context);

      switch (field) {
        case 'hour': {
          const [start, end] = Array.isArray(value)
            ? value
            : JSON.parse(value || '[0, 23]');
          const current = context.currentHour;
          if (current < start || current > end) return false;
          break;
        }
        case 'year': {
          const expected = Array.isArray(value) ? value[0] : Number(value);
          if (context.currentYear !== expected) return false;
          break;
        }
        case 'gestion': {
          const gestionValue = String(value);
          if (!gestionValue.includes(context.currentYear.toString()))
            return false;
          break;
        }
      }
    }
    return true;
  }

  private parseStaticConditions(
    conds: Condition[],
    context: Record<string, any>,
  ): Record<string, any> {
    const conditionObject: Record<string, any> = {};

    for (const cond of conds) {
      if (['hour', 'year', 'gestion'].includes(cond.field)) continue;

      const field = cond.field;
      const value = this.parseValue(cond.value, context);

      const operatorMap: Record<string, string> = {
        eq: 'equals',
        ne: 'not',
        in: 'in',
        nin: 'notIn',
        gt: 'gt',
        gte: 'gte',
        lt: 'lt',
        lte: 'lte',
        between: 'between',
      };

      const op = operatorMap[cond.operator];
      if (!op) continue;

      if (!conditionObject[field]) conditionObject[field] = {};

      if (op === 'between' && Array.isArray(value) && value.length === 2) {
        conditionObject[field] = { gte: value[0], lte: value[1] };
      } else {
        conditionObject[field][op] = value;
      }
    }

    return conditionObject;
  }

  private parseValue(value: any, context: Record<string, any>): any {
    if (typeof value === 'string') {
      for (const key of Object.keys(context)) {
        const placeholder = `{{${key}}}`;
        if (value.includes(placeholder)) {
          value = value.replaceAll(placeholder, JSON.stringify(context[key]));
        }
      }
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
