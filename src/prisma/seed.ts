import { AcademicStatus, EducationLevel, Gender, PrismaClient, TypeAction, TypeSubject } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createDebtTrigger } from './triggers/inscription-debt.trigger';
import { createInscriptionTypeTrigger } from './triggers/inscription-type.trigger';
import { createDebtOnBookingTrigger } from './triggers/inscription-debt-booking.trigger';
import { createUpdateRemainingBalanceTrigger } from './triggers/payment-debt.trigger';

async function main() {
  const prisma = new PrismaClient();

  try {

    const salt = bcrypt.genSaltSync(10);
    const user = await prisma.user.create({
      data: {
        numberDocument: '123456789',
        typeDocument: 'DNI',
        name: 'moises',
        lastName: 'ochoa',
        email: 'moisic.mo@gmail.com',
        phone: [],
        password: bcrypt.hashSync('Muyseguro123*', salt),
      },
    });

    const city = await prisma.city.create({
      data: {
        name: 'La Paz',
        createdById: user.id,
      },
    });

    const actions = [TypeAction.read, TypeAction.create, TypeAction.update, TypeAction.delete, TypeAction.manage];

    const permissions = await Promise.all(
      actions.map((action) =>
        prisma.permission.create({
          data: {
            action,
            subject: TypeSubject.all,
            createdById: user.id,
          },
        }),
      ),
    );

    const role = await prisma.role.create({
      data: {
        name: 'admin',
        createdById: user.id,
        permissions: {
          connect: permissions.map((p) => ({ id: p.id })),
        },
      },
    });

    const addressBranch = await prisma.address.create({
      data: {
        cityId: city.id,
        zone: 'San Pedro',
        detail: 'Av Algo #221',
        createdById: user.id,
      }
    });
    const branch = await prisma.branch.create({
      data: {
        name: 'Casa Matríz',
        phone: ['123456789'],
        addressId: addressBranch.id,
        createdById: user.id,
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
        createdById: user.id,
      }
    });

    // creando un profesor
    const addressTeacher = await prisma.address.create({
      data: {
        cityId: city.id,
        zone: 'San Pedro',
        detail: 'Av Algo #221',
        createdById: user.id,
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
            createdById: user.id,
          },
        },
        createdById: user.id,
      },
    })
    // creando un tutor
    const addressTutor = await prisma.address.create({
      data: {
        cityId: city.id,
        zone: 'San Pedro',
        detail: 'Av Algo #221',
        createdById: user.id,
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
            createdById: user.id,
          },
        },
        createdById: user.id,
      },
    });
    // creando un estudiante
    const school = await prisma.school.create({
      data: {
        name: 'San Calixto',
        createdById: user.id,
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
            createdById: user.id,
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
            createdById: user.id,
          }
        },
        createdById: user.id,
      }
    });

    console.log('✅ Datos de semilla insertados correctamente.');
    await createDebtTrigger(prisma);
    await createInscriptionTypeTrigger(prisma);
    await createDebtOnBookingTrigger(prisma);
    await createUpdateRemainingBalanceTrigger(prisma);

  } catch (error) {
    console.error('❌ Error al insertar datos de semilla:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
