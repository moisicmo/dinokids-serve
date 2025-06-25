import { SetMetadata } from '@nestjs/common';
import { TypeSubject, TypeAction } from '@prisma/client';

export const CHECK_ABILITY = 'check_ability';

export interface RequiredRule {
  action: TypeAction;
  subject: TypeSubject;
  conditions?: any;
}

export const checkAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
