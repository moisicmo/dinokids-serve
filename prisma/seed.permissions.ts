import { prisma } from '../src/lib/prisma';
import { TypeAction } from '@/generated/prisma/client';


const CREATED_BY = 'system-seed';

const subjects = [
  'all',
  'branch',
  'permission',
  'role',
  'user',
  'staff',
  'tutor',
  'teacher',
  'student',
  'assignmentRoom',
  'assignmentSchedule',
  'booking',
  'room',
  'specialty',
  'schedule',
  'inscription',
  'payment',
  'invoice',
  'refund',
  'price',
  'report',
  'debt',
  'attendance',
] as const;

const actions: TypeAction[] = [
  TypeAction.manage,
  TypeAction.create,
  TypeAction.read,
  TypeAction.update,
  TypeAction.delete,
];

async function seedPermissions() {
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

  console.log('✅ permissions seeded');
}

seedPermissions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
