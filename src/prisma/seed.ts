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
        password: bcrypt.hashSync('Muyseguro123*', salt),
      },
    });
    const role = await prisma.role.create({
      data: { name: 'admin' }
    });
    await prisma.permission.createManyAndReturn({
      data: [
        { roleId: role.id, action: TypeAction.read, subject: TypeSubject.all },
        { roleId: role.id, action: TypeAction.create, subject: TypeSubject.all },
        { roleId: role.id, action: TypeAction.update, subject: TypeSubject.all },
        { roleId: role.id, action: TypeAction.delete, subject: TypeSubject.all },
        { roleId: role.id, action: TypeAction.manage, subject: TypeSubject.all },
      ]
    });

    const branch = await prisma.branch.create({
      data: {
        name: 'Casa Matríz',
        address: 'Avenida X',
        phone: '123456789',
      }
    })

    await prisma.staff.create({
      data: {
        userId: user.id,
        roleId: role.id,
        branches: {
          connect: [
            { id: branch.id }
          ],
        }
      }
    });

    // creando un profesor
    await prisma.user.create({
      data: {
        numberDocument: '123321',
        typeDocument: 'DNI',
        name: 'Juan',
        lastName: 'Chambi',
        email: 'juan@gmail.com',
        password: bcrypt.hashSync('Muyseguro123*', salt),
        teacher: {
          create: {
            zone: 'San Pedro',
            address: '20 de octubre',
            major: 'Licenciado',
            academicStatus: AcademicStatus.EGRESADO,
            startJob: new Date(),
          },
        },
      },
    })
    // creando un tutor
    const tutor = await prisma.user.create({
      data: {
        numberDocument: '3445452',
        typeDocument: 'DNI',
        name: 'Maria',
        lastName: 'Cruz',
        email: 'maria@gmail.com',
        password: bcrypt.hashSync('Muyseguro123*', salt),
        tutor: {
          create: {
            city: 'La Paz',
            zone: 'San Pedro',
            address: '20 de octubre',
          },
        },
      },
    });
    // creando un estudiante
    await prisma.user.create({
      data: {
        numberDocument: '21321312',
        typeDocument: 'DNI',
        name: 'Sebastian',
        lastName: 'Cruz',
        email: 'sebastian@gmail.com',
        password: bcrypt.hashSync('Muyseguro123*', salt),
        student: {
          create: {
            code: 'STU21321312',
            birthdate: new Date(),
            gender: Gender.FEMENINO,
            school: 'San Calixto',
            grade: 5,
            educationLevel: EducationLevel.PRIMARIA,
            tutors: {
              connect: [
                { userId: tutor.id }
              ],
            }
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
          }
        }
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
