import * as bcrypt from 'bcrypt';
import { createDebtTrigger } from './triggers/inscription-debt.trigger';
import { createInscriptionTypeTrigger } from './triggers/inscription-type.trigger';
import { createDebtOnBookingTrigger } from './triggers/inscription-debt-booking.trigger';
import { createUpdateRemainingBalanceTrigger } from './triggers/payment-debt.trigger';

import { prisma } from '../src/lib/prisma';
import { AcademicStatus, EducationLevel, Gender, TypeAction, TypeDocument } from '@/generated/prisma/enums';
import { TypeSubject } from '@/common/enums';
import { Permission } from '@/generated/prisma/client';

const SUPER_ADMIN_EMAIL = 'moisic.mo@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Muyseguro123*';

async function main() {
  console.log("🚀 Iniciando proceso de seeding...");

  try {
    // ============================================
    // 1. CREAR TODOS LOS PERMISOS DEL SISTEMA
    // ============================================
    console.log("📋 Creando permisos del sistema...");

    const actions: TypeAction[] = [
      TypeAction.manage,
      TypeAction.create,
      TypeAction.read,
      TypeAction.update,
      TypeAction.delete,
    ];

    // Obtener todos los subjects del enum
    const subjects = Object.values(TypeSubject).filter(
      value => typeof value === 'string'
    ) as string[];

    // Crear todos los permisos (acción × módulo) en paralelo
    const upsertPromises: Promise<Permission>[] = [];

    for (const subject of subjects) {
      for (const action of actions) {
        upsertPromises.push(
          prisma.permission.upsert({
            where: {
              action_subject: { action, subject },
            },
            update: {
              active: true,
              updatedAt: new Date(),
              updatedBy: SUPER_ADMIN_EMAIL
            },
            create: {
              action,
              subject,
              active: true,
              createdBy: SUPER_ADMIN_EMAIL,
            },
          })
        );
      }
    }

    const permissions = await Promise.all(upsertPromises);

    console.log(`✅ ${permissions.length} permisos creados/actualizados`);
    console.log(`📊 ${subjects.length} módulos × ${actions.length} acciones`);

    // ============================================
    // 2. CREAR USUARIO SUPER ADMIN
    // ============================================
    console.log("\n👑 Creando usuario Super Admin...");

    const salt = bcrypt.genSaltSync(10);
    const user = await prisma.user.upsert({
      where: { numberDocument: '123456789' },
      update: {
        // Actualizar solo algunos campos si el usuario ya existe
        email: SUPER_ADMIN_EMAIL,
        emailValidated: true,
        password: bcrypt.hashSync(SUPER_ADMIN_PASSWORD, salt),
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
      },
      create: {
        numberDocument: '123456789',
        typeDocument: TypeDocument.DNI,
        name: 'Moises',
        lastName: 'Ochoa',
        email: SUPER_ADMIN_EMAIL,
        emailValidated: true,
        password: bcrypt.hashSync(SUPER_ADMIN_PASSWORD, salt),
        phone: ['+591 12345678'],
        createdBy: SUPER_ADMIN_EMAIL,
      },
    });

    console.log(`✅ Usuario Super Admin creado: ${user.email}`);

    // ============================================
    // 3. CREAR ROL "SUPER ADMINISTRADOR"
    // ============================================
    console.log("\n🎭 Creando rol Super Administrador...");

    const superAdminRole = await prisma.role.upsert({
      where: { name: 'Super Administrador' },
      update: {
        active: true,
        // Actualizar permisos si el rol ya existe
        permissions: {
          set: [], // Limpiar permisos existentes
          connect: permissions.map(p => ({ id: p.id })),
        },
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
      },
      create: {
        name: 'Super Administrador',
        active: true,
        createdBy: SUPER_ADMIN_EMAIL,
        permissions: {
          connect: permissions.map(p => ({ id: p.id })),
        },
      },
    });

    console.log(`✅ Rol creado: "${superAdminRole.name}"`);

    // ============================================
    // 3.2 CREAR ROL "PROFESOR"
    // ============================================
    console.log("\n🎭 Creando rol Profesor...");

    const teacherPermissionMatrix = [
      { action: TypeAction.create, subject: TypeSubject.assignmentSchedule },
      { action: TypeAction.update, subject: TypeSubject.assignmentSchedule },
      { action: TypeAction.create, subject: TypeSubject.sessionTracking },
      { action: TypeAction.update, subject: TypeSubject.sessionTracking },
      { action: TypeAction.create, subject: TypeSubject.evaluationPlanning },
      { action: TypeAction.update, subject: TypeSubject.evaluationPlanning },
      { action: TypeAction.create, subject: TypeSubject.weeklyPlanning },
      { action: TypeAction.update, subject: TypeSubject.weeklyPlanning },
      { action: TypeAction.manage, subject: TypeSubject.attendance },
      { action: TypeAction.update, subject: TypeSubject.attendance },
      { action: TypeAction.create, subject: TypeSubject.attendance },
      { action: TypeAction.create, subject: TypeSubject.student },
      { action: TypeAction.update, subject: TypeSubject.student },
      { action: TypeAction.read, subject: TypeSubject.student },
    ];

    const teacherPermissions = await prisma.permission.findMany({
      where: {
        OR: teacherPermissionMatrix,
      },
      select: { id: true },
    });

    await prisma.role.upsert({
      where: { name: 'Profesor' },
      update: {
        active: true,
        // Actualizar permisos si el rol ya existe
        permissions: {
          set: teacherPermissions.map((p) => ({ id: p.id })),
        },
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
      },
      create: {
        name: 'Profesor',
        active: true,
        createdBy: SUPER_ADMIN_EMAIL,
        permissions: {
          connect: teacherPermissions.map((p) => ({ id: p.id })),
        },
      },
    });

    console.log(`✅ Rol creado: "${superAdminRole.name}"`);

    // ============================================
    // 4. CREAR DIRECCIÓN PARA SUCURSAL
    // ============================================
    console.log("\n📍 Creando dirección para sucursal...");

    const addressBranch = await prisma.address.upsert({
      where: {
        city_zone_detail: {
          city: 'La Paz',
          zone: 'San Pedro',
          detail: 'Av. 16 de Julio #1234',
        }
      },
      update: {
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
      },
      create: {
        city: 'La Paz',
        zone: 'San Pedro',
        detail: 'Av. 16 de Julio #1234',
        createdBy: SUPER_ADMIN_EMAIL,
      }
    });

    console.log(`✅ Dirección creada: ${addressBranch.zone}, ${addressBranch.city}`);

    // ============================================
    // 5. CREAR SUCURSAL PRINCIPAL
    // ============================================
    console.log("\n🏢 Creando sucursal principal...");

    const mainBranch = await prisma.branch.upsert({
      where: { name: 'Casa Matriz' },
      update: {
        phone: ['+591 2 2123456'],
        addressId: addressBranch.id,
        active: true,
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
      },
      create: {
        name: 'Casa Matriz',
        phone: ['+591 2 2123456'],
        addressId: addressBranch.id,
        active: true,
        createdBy: SUPER_ADMIN_EMAIL,
      }
    });

    console.log(`✅ Sucursal creada: "${mainBranch.name}"`);

    // ============================================
    // 6. ASIGNAR STAFF (SUPER ADMIN) A LA SUCURSAL
    // ============================================
    console.log("\n👔 Asignando Super Admin como staff...");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        roleId: superAdminRole.id,
      }
    });
    
    await prisma.staff.upsert({
      where: { userId: user.id },
      update: {
        active: true,
        superStaff: true,
        branches: {
          set: [], // Limpiar sucursales existentes
          connect: [{ id: mainBranch.id }]
        },
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
      },
      create: {
        userId: user.id,
        active: true,
        superStaff: true,
        branches: {
          connect: [{ id: mainBranch.id }]
        },
        createdBy: SUPER_ADMIN_EMAIL,
      }
    });

    console.log(`✅ Super Admin asignado como staff de "${mainBranch.name}"`);

    // ============================================
    // 7. DATOS DEMO (OPCIONAL - PARA DESARROLLO)
    // ============================================
    console.log("\n🎭 Creando datos de demostración...");

    // Solo crear datos demo si estamos en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await createDemoData(mainBranch.id, SUPER_ADMIN_EMAIL);
    }

    // ============================================
    // 8. CREAR TRIGGERS DE LA BASE DE DATOS
    // ============================================
    console.log("\n⚡ Creando triggers de base de datos...");

    await createDebtTrigger();
    await createInscriptionTypeTrigger();
    await createDebtOnBookingTrigger();
    await createUpdateRemainingBalanceTrigger();

    console.log("✅ Todos los triggers creados correctamente");

    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEED COMPLETADO EXITOSAMENTE");
    console.log("=".repeat(50));
    console.log(`👑 Super Admin: ${SUPER_ADMIN_EMAIL}`);
    console.log(`🔑 Contraseña: ${SUPER_ADMIN_PASSWORD}`);
    console.log(`🏢 Sucursal: ${mainBranch.name}`);
    console.log(`🔐 Permisos: ${permissions.length} creados`);
    console.log("=".repeat(50));
    console.log("\n⚠️  ¡IMPORTANTE!");
    console.log("1. Cambia la contraseña del Super Admin después del primer login");
    console.log("2. Revisa los triggers creados en la base de datos");
    console.log("3. Configura roles adicionales según sea necesario");
    console.log("=".repeat(50));

  } catch (error) {
    console.error('\n❌ ERROR durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// FUNCIÓN PARA DATOS DEMO (DESARROLLO)
// ============================================
async function createDemoData(branchId: string, createdBy: string) {
  const salt = bcrypt.genSaltSync(10);

  const teacherRole = await prisma.role.findFirst({
    where: { name: "Profesor"}
  })

  try {
    // Crear profesor demo
    const addressTeacher = await prisma.address.create({
      data: {
        city: 'La Paz',
        zone: 'Miraflores',
        detail: 'Av. Busch #567',
        createdBy: createdBy,
      }
    });

    const teacherUser = await prisma.user.upsert({
      where: { numberDocument: '87654321' },
      update: {
        name: 'Juan',
        lastName: 'Pérez',
        email: 'moiseso@sintesis.com.bo',
        phone: ['+591 76543210'],
        roleId: teacherRole?.id,
        password: bcrypt.hashSync('Muyseguro123*', salt),
        addressId: addressTeacher.id,
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        numberDocument: '87654321',
        typeDocument: TypeDocument.DNI,
        name: 'Juan',
        lastName: 'Pérez',
        email: 'moiseso@sintesis.com.bo',
        phone: ['+591 76543210'],
        roleId: teacherRole?.id,
        password: bcrypt.hashSync('Muyseguro123*', salt),
        addressId: addressTeacher.id,
        createdBy: createdBy,
      },
    });

    await prisma.teacher.upsert({
      where: { userId: teacherUser.id },
      update: {
        major: 'Licenciado en Psicología',
        academicStatus: AcademicStatus.EGRESADO,
        startJob: new Date(),
        active: true,
        branches: {
          connect: [{ id: branchId }]
        },
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        userId: teacherUser.id,
        major: 'Licenciado en Psicología',
        academicStatus: AcademicStatus.EGRESADO,
        startJob: new Date(),
        active: true,
        branches: {
          connect: [{ id: branchId }]
        },
        createdBy: createdBy,
      },
    });

    // Crear tutor demo
    const addressTutor = await prisma.address.create({
      data: {
        city: 'La Paz',
        zone: 'Obrajes',
        detail: 'Calle 5 #321',
        createdBy: createdBy,
      }
    });

    const tutorUser = await prisma.user.upsert({
      where: { numberDocument: '11223344' },
      update: {
        name: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@demo.com',
        phone: ['+591 77788899'],
        password: bcrypt.hashSync('Muyseguro123*', salt),
        addressId: addressTutor.id,
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        numberDocument: '11223344',
        typeDocument: TypeDocument.DNI,
        name: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@demo.com',
        phone: ['+591 77788899'],
        password: bcrypt.hashSync('Muyseguro123*', salt),
        addressId: addressTutor.id,
        createdBy: createdBy,
      },
    });

    const tutor = await prisma.tutor.upsert({
      where: { userId: tutorUser.id },
      update: {
        active: true,
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        userId: tutorUser.id,
        active: true,
        createdBy: createdBy,
      },
    });

    // Crear escuela demo
    const school = await prisma.school.upsert({
      where: { name: 'Colegio San Calixto' },
      update: {
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        name: 'Colegio San Calixto',
        createdBy: createdBy,
      }
    });

    // Crear estudiante demo
    const studentUser = await prisma.user.upsert({
      where: { numberDocument: '99887766' },
      update: {
        name: 'Carlos',
        lastName: 'González',
        email: 'carlos.gonzalez@demo.com',
        password: bcrypt.hashSync('Muyseguro123*', salt),
        phone: [],
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        numberDocument: '99887766',
        typeDocument: TypeDocument.DNI,
        name: 'Carlos',
        lastName: 'González',
        email: 'carlos.gonzalez@demo.com',
        password: bcrypt.hashSync('Muyseguro123*', salt),
        phone: [],
        createdBy: createdBy,
      },
    });

    await prisma.student.upsert({
      where: { userId: studentUser.id },
      update: {
        schoolId: school.id,
        code: 'STU2024001',
        birthdate: new Date('2010-05-15'),
        gender: Gender.MASCULINO,
        grade: 5,
        educationLevel: EducationLevel.PRIMARIA,
        active: true,
        tutors: {
          connect: [{ userId: tutor.userId }]
        },
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        userId: studentUser.id,
        schoolId: school.id,
        code: 'STU2024001',
        birthdate: new Date('2010-05-15'),
        gender: Gender.MASCULINO,
        grade: 5,
        educationLevel: EducationLevel.PRIMARIA,
        active: true,
        tutors: {
          connect: [{ userId: tutor.userId }]
        },
        createdBy: createdBy,
      },
    });

    // Crear especialidad demo
    const specialty = await prisma.specialty.upsert({
      where: { name: 'Psicología Educativa' },
      update: {
        active: true,
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        name: 'Psicología Educativa',
        active: true,
        createdBy: createdBy,
      }
    });

    await prisma.branchSpecialty.upsert({
      where: {
        branchId_specialtyId: {
          branchId: branchId,
          specialtyId: specialty.id,
        }
      },
      update: {
        estimatedSessionCost: 25.00,
        numberSessions: 30,
        active: true,
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        branchId: branchId,
        specialtyId: specialty.id,
        estimatedSessionCost: 25.00,
        numberSessions: 30,
        active: true,
        createdBy: createdBy,
      }
    });

    console.log("✅ Datos demo creados correctamente");
  } catch (error) {
    console.warn("⚠️  Algunos datos demo no pudieron crearse:", error instanceof Error ? error.message : 'Error desconocido');
    // Continuamos aunque falle la creación de datos demo
  }
}

// ============================================
// EJECUCIÓN PRINCIPAL
// ============================================
main()
  .then(() => {
    console.log("\n✨ Proceso de seeding finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 ERROR CRÍTICO:', error);
    process.exit(1);
  });