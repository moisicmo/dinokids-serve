import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UserSelect } from '@/common';
import { startOfDay, endOfDay } from 'date-fns';
import { StudentSelect } from '../student/entities/student.entity';
import { InscriptionSelect } from '../inscription/entities/inscription.entity';
import { DebtSelect } from '../debt/entities/debt.entity';
import { AssignmentRoomEntity } from '../inscription/entities/assignment-room.entity';
import { AssignmentSchedulesEntity } from '../inscription/entities/assignment-schedule.entity';
import { SessionEntity } from './entities/attendance.entity';
import { AttendanceStatus } from '@/generated/prisma/enums';

const FullStudentSelect = {
  ...UserSelect,
  student: {
    select: {
      ...StudentSelect,
      inscriptions: {
        select: {
          ...InscriptionSelect,
          assignmentRooms: {
            select: {
              ...AssignmentRoomEntity,
              assignmentSchedules: {
                select: {
                  ...AssignmentSchedulesEntity,
                  sessions: { select: SessionEntity },
                },
              },
            },
          },
          debts: { select: DebtSelect },
        },
      },
    },
  },
};

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) { }

  async search(q: string, branchId: string) {
    if (!q || q.trim().length < 2) return [];

    const students = await this.prisma.student.findMany({
      where: {
        OR: [
          { user: { name: { contains: q, mode: 'insensitive' } } },
          { user: { lastName: { contains: q, mode: 'insensitive' } } },
          { user: { numberDocument: { contains: q } } },
          { user: { numberCard: { contains: q } } },
          { tutors: { some: { user: { numberDocument: { contains: q } } } } },
        ],
      },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            numberDocument: true,
            numberCard: true,
          },
        },
        tutors: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                lastName: true,
                numberDocument: true,
              },
            },
          },
        },
      },
      take: 20,
    });

    return students;
  }

  async create(email: string, createAttendanceDto: CreateAttendanceDto) {
    const { branchId, numberCard, userId } = createAttendanceDto;

    if (!numberCard && !userId) {
      throw new BadRequestException('Debe proporcionar numberCard o userId');
    }

    // 🔹 Buscar usuario por número de tarjeta o por userId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: FullStudentSelect,
    });

    if (!user) {
      throw new NotFoundException(
        numberCard
          ? 'No se encontró un usuario con ese número de tarjeta'
          : 'No se encontró el usuario',
      );
    }

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // 🔹 Buscar si tiene registro de ingreso hoy sin salida
    const lastRecord = await this.prisma.accessRecord.findFirst({
      where: {
        userId: user.id,
        checkIn: { gte: todayStart, lte: todayEnd },
        checkOut: null,
      },
    });

    // 🔸 Si ya está dentro → registrar salida
    if (lastRecord) {
      await this.prisma.accessRecord.update({
        where: { id: lastRecord.id },
        data: { checkOut: new Date() },
      });

      return {
        message: 'Salida registrada correctamente',
        action: 'checkout',
        user,
      };
    }

    // 🔸 Si no tiene registro → registrar ingreso
    await this.prisma.accessRecord.create({
      data: {
        branchId,
        userId: user.id,
        checkIn: new Date(),
        createdBy: email,
      },
    });

    // 🧩 Actualizar sesiones del día a PRESENT
    const updatedSessions = await this.prisma.session.updateMany({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        status: AttendanceStatus.PENDING,
        assignmentSchedule: {
          assignmentRoom: {
            inscription: {
              studentId: user.id,
              active: true,
            },
          },
        },
      },
      data: {
        status: AttendanceStatus.PRESENT,
      },
    });

    return {
      message:
        updatedSessions.count > 0
          ? `Ingreso registrado y ${updatedSessions.count} sesión(es) marcadas como PRESENTE`
          : 'Ingreso registrado. No había clases programadas hoy.',
      action: 'checkin',
      user,
    };
  }
}
