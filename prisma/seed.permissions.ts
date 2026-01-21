import { TypeSubject } from '@/common/enums';
import { prisma } from '../src/lib/prisma';
import { TypeAction } from '@/generated/prisma/client';

const CREATED_BY = 'system-seed';

const actions: TypeAction[] = [
  TypeAction.manage,
  TypeAction.create,
  TypeAction.read,
  TypeAction.update,
  TypeAction.delete,
];

async function seedPermissions() {
  // Convertir el enum a array de valores usando Object.values
  const subjects = Object.values(TypeSubject);
  
  for (const subject of subjects) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: {
          action_subject: { action, subject },
        },
        update: { active: true },
        create: {
          action,
          subject,
          active: true,
          createdBy: CREATED_BY,
        },
      });
    }
  }

  console.log(`✅ ${subjects.length * actions.length} permissions seeded`);
}

seedPermissions()
  .catch(console.error)
  .then(() => prisma.$disconnect());