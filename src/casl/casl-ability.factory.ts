import { Injectable } from '@nestjs/common';
import { PrismaAbility, createPrismaAbility } from '@casl/prisma';
import { Permission, User, TypeAction, TypeSubject } from '@prisma/client';

export type AppAbility = PrismaAbility<[TypeAction, TypeSubject]>;

@Injectable()
export class CaslAbilityFactory {
  createForPermissions(user: User, permissions: Permission[]): AppAbility {
    const rules = permissions.map((perm) => {
      const rule: any = {
        action: perm.action,
        subject: perm.subject,
        inverted: perm.inverted,
        reason: perm.reason,
      };

      if (perm.conditions) {
        rule.conditions = this.parseConditions(perm.conditions, user);
      }

      return rule;
    });

    return createPrismaAbility<AppAbility>(rules);
  }

  private parseConditions(conditions: any, user: User): any {
    // Permite usar plantillas tipo {{ id }} en las condiciones
    const parsed = JSON.parse(JSON.stringify(conditions), (_, value) => {
      if (typeof value === 'string' && value.includes('{{')) {
        return value.replace(/{{\s*id\s*}}/g, user.id);
      }
      return value;
    });

    return parsed;
  }
}
