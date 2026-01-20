import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';
import { SetMetadata } from '@nestjs/common';

export const CHECK_ABILITY = 'check_ability';

export interface RequiredRule {
  action: TypeAction;
  subject: TypeSubject;
  conditions?: any;
}

export const checkAbilities = (...requirements: RequiredRule[]) => {
  console.log('checkAbilities',requirements)
  return SetMetadata(CHECK_ABILITY, requirements);
};
