import * as bcrypt from 'bcrypt';
import { createDebtTrigger } from './triggers/inscription-debt.trigger';
import { createInscriptionTypeTrigger } from './triggers/inscription-type.trigger';
import { createDebtOnBookingTrigger } from './triggers/inscription-debt-booking.trigger';
import { createUpdateRemainingBalanceTrigger } from './triggers/payment-debt.trigger';

import { prisma } from '../src/lib/prisma';
import { AcademicStatus, EducationLevel, Gender, TypeAction, TypeDocument } from '@/generated/prisma/enums';
async function main() {
  console.log("Start of Seeding Data - ");

  try {
    const email = 'moisic.mo@gmail.com';

    const salt = bcrypt.genSaltSync(10);
    const user = await prisma.user.upsert({
      where: { numberDocument: '123456789' },
      update: {},
      create: {
        numberDocument: '123456789',
        typeDocument: TypeDocument.DNI,
        name: 'moises',
        lastName: 'ochoa',
        email: email,
        emailValidated: true,
        password: bcrypt.hashSync('Muyseguro123*', salt),
        phone: [],
      },
    });

    const actions = [TypeAction.read, TypeAction.create, TypeAction.update, TypeAction.delete, TypeAction.manage];

    const permissions = await Promise.all(
      actions.map((action) =>
        prisma.permission.create({
          data: {
            action,
            subject: 'all',
            createdBy: email,
          },
        }),
      ),
    );

    const role = await prisma.role.create({
      data: {
        name: 'admin',
        createdBy: email,
        permissions: {
          connect: permissions.map((p) => ({ id: p.id })),
        },
      },
    });

    const addressBranch = await prisma.address.create({
      data: {
        city: 'La Paz',
        zone: 'San Pedro',
        detail: 'Av Algo #221',
        createdBy: email,
      }
    });
    const branch = await prisma.branch.create({
      data: {
        name: 'Casa Matríz',
        phone: ['123456789'],
        addressId: addressBranch.id,
        createdBy: email,
      }
    });

    await prisma.staff.create({
      data: {
        userId: user.id,
        roleId: role.id,
        branches: {
          connect: [
            { id: branch.id }
          ],
        },
        createdBy: email,
      }
    });

    // creando un profesor
    const addressTeacher = await prisma.address.create({
      data: {
        city: 'La Paz',
        zone: 'San Pedro',
        detail: 'Av Algo #221',
        createdBy: email,
      }
    });
    await prisma.user.create({
      data: {
        numberDocument: '123321',
        typeDocument: 'DNI',
        name: 'Juan',
        lastName: 'Chambi',
        email: 'juan@gmail.com',
        phone: ['123456789'],
        password: bcrypt.hashSync('Muyseguro123*', salt),
        addressId: addressTeacher.id,
        teacher: {
          create: {
            major: 'Licenciado',
            academicStatus: AcademicStatus.EGRESADO,
            startJob: new Date(),
            createdBy: email,
          },
        },
      },
    })
    // creando un tutor
    const addressTutor = await prisma.address.create({
      data: {
        city: 'La Paz',
        zone: 'San Pedro',
        detail: 'Av Algo #221',
        createdBy: email,
      }
    });
    const tutor = await prisma.user.create({
      data: {
        numberDocument: '3445452',
        typeDocument: 'DNI',
        name: 'Maria',
        lastName: 'Cruz',
        email: 'maria@gmail.com',
        phone: ['123456789'],
        password: bcrypt.hashSync('Muyseguro123*', salt),
        addressId: addressTutor.id,
        tutor: {
          create: {
            createdBy: email,
          },
        },
      },
    });
    // creando un estudiante
    const school = await prisma.school.create({
      data: {
        name: 'San Calixto',
        createdBy: email,
      }
    });
    await prisma.user.create({
      data: {
        numberDocument: '21321312',
        typeDocument: 'DNI',
        name: 'Sebastian',
        lastName: 'Cruz',
        email: 'sebastian@gmail.com',
        password: bcrypt.hashSync('Muyseguro123*', salt),
        phone: [],
        student: {
          create: {
            code: 'STU21321312',
            birthdate: new Date(),
            gender: Gender.MASCULINO,
            schoolId: school.id,
            grade: 5,
            educationLevel: EducationLevel.PRIMARIA,
            tutors: {
              connect: [
                { userId: tutor.id }
              ],
            },
            createdBy: email,
          },
        },
      },
    });
    // creando una especialidad
    await prisma.specialty.create({
      data: {
        name: 'Psicologia',
        branchSpecialties: {
          create: {
            branchId: branch.id,
            estimatedSessionCost: 20.0,
            numberSessions: 30,
            createdBy: email,
          }
        },
        createdBy: email,
      }
    });
    console.log('✅ Datos de semilla insertados correctamente.');
    await createDebtTrigger();
    await createInscriptionTypeTrigger();
    await createDebtOnBookingTrigger();
    await createUpdateRemainingBalanceTrigger();

  } catch (error) {
    console.error('❌ Error al insertar datos de semilla:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
