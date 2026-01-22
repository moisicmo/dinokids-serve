import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserSelect } from '@/common'; import { StudentSelect, StudentType } from './entities/student.entity';
import { Prisma } from '@/generated/prisma/client';
import { randomUUID } from 'crypto';
@Injectable()

export class StudentService {

  constructor(private readonly prisma: PrismaService) { }

  async create(email: string, createStudentDto: CreateStudentDto) {
    try {
      const { birthdate, gender, school, grade, educationLevel, tutorIds, sessionTrackings, weeklyPlannings, evaluationPlannings, ...userDto } = createStudentDto;

      if (userDto.numberDocument) {
        const userExists = await this.prisma.user.findUnique({
          where: { numberDocument: userDto.numberDocument },
          select: UserSelect,
        });

        if (userExists) {
          throw new ConflictException('El usuario ya existe');
        }
      }

      // Buscar o crear colegio
      let schoolRecord = await this.prisma.school.findUnique({
        where: { name: school },
      });

      if (!schoolRecord && school) {
        schoolRecord = await this.prisma.school.create({
          data: {
            name: school,
            createdBy: email,
          },
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(userDto.email ?? 'withoutpassword', salt);
      const studentCode = userDto.numberDocument
        ? `STU-${userDto.numberDocument}`
        : `STU-${randomUUID().slice(0, 8).toUpperCase()}`;

      return await this.prisma.user.create({
        data: {
          ...userDto,
          password: hashedPassword,
          createdBy: email,
          student: {
            create: {
              code: studentCode,
              birthdate,
              gender,
              grade,
              educationLevel,
              tutors: {
                connect: tutorIds.map((userId) => ({ userId })),
              },
              ...(schoolRecord && {
                school: {
                  connect: { id: schoolRecord.id },
                },
              }),

              sessionTrackings,
              weeklyPlannings,
              evaluationPlannings,
              createdBy: email,
            },
          },

        },
        select: UserSelect,
      });

    } catch (error) {
      console.error('❌ Error en create(Student):', error);

      // Re-lanza las excepciones de NestJS sin reemplazarlas
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ConflictException) throw error;
      if (error instanceof BadRequestException) throw error;

      // Para cualquier otro error inesperado:
      throw new InternalServerErrorException('Hubo un error al crear un estudiante');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<StudentType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;


      const whereClause: Prisma.StudentWhereInput = {
        active: true,
        ...(keys
          ? {
            user: {
              OR: [
                { name: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                { lastName: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                { numberDocument: { contains: keys, mode: Prisma.QueryMode.insensitive } },
              ],
            },
          }
          : {}),
      };

      // 🔹 Paginación
      const total = await this.prisma.student.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);
      const data = await this.prisma.student.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: StudentSelect,
      });

      return { data, meta: { total, page, lastPage } };

    } catch (error) {
      console.error('❌ Error en findAll(Student):', error);

      // Manejo de errores más claro y consistente
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar estudiantes');
    }
  }

  async findOne(id: string): Promise<StudentType> {
    const student = await this.prisma.student.findUnique({
      where: { userId: id },
      select: StudentSelect,
    });

    if (!student) {
      throw new NotFoundException(`Student with id #${id} not found`);
    }

    return student;
  }

  async update(email: string, id: string, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);

    const {
      birthdate,
      gender,
      school,
      grade,
      educationLevel,
      tutorIds,
      sessionTrackings,
      weeklyPlannings,
      evaluationPlannings,
      ...userDto
    } = updateStudentDto;

    let schoolRecord: { id: string } | null = null;

    if (school !== undefined) {
      if (school === null || school === '') {
        schoolRecord = null;
      } else {
        schoolRecord = await this.prisma.school.findUnique({
          where: { name: school },
        });

        if (!schoolRecord) {
          schoolRecord = await this.prisma.school.create({
            data: {
              name: school,
              createdBy: email,
            },
          });
        }
      }
    }

    const studentCode = userDto.numberDocument
      ? `STU-${userDto.numberDocument}`
      : undefined;

    return this.prisma.user.update({
      where: {
        id,
        student: {
          isNot: null,
        },
      },
      data: {
        ...userDto,
        student: {
          update: {
            where: { userId: id },
            data: {
              ...(studentCode && { code: studentCode }),

              birthdate,
              gender,
              grade,
              educationLevel,

              ...(tutorIds && {
                tutors: {
                  set: tutorIds.map((userId) => ({ userId })),
                },
              }),

              ...(school !== undefined &&
                (schoolRecord
                  ? {
                    school: {
                      connect: { id: schoolRecord.id },
                    },
                  }
                  : {
                    school: {
                      disconnect: true,
                    },
                  })),

              sessionTrackings,
              weeklyPlannings,
              evaluationPlannings,

              updatedBy: email,
            },
          },
        },
      },
      select: UserSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.user.update({
      where: {
        id,
        student: {
          isNot: null,
        },
      },
      data: {
        student: {
          update: {
            where: { userId: id },
            data: {
              active: false,
            },
          },
        },
      },
      select: UserSelect,
    });
  }
}