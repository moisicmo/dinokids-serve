import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserEntity } from '@/common'; import { StudentSelect, StudentType } from './entities/student.entity';
import { Prisma } from '@prisma/client';
import { CaslFilterContext } from '@/common/extended-request';
import { cleanCaslFilterForModel } from '@/common/casl.util';
@Injectable()

export class StudentService {

  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, createStudentDto: CreateStudentDto) {
    try {
      const { birthdate, gender, school, grade, educationLevel, tutorIds, ...userDto } = createStudentDto;

      if (userDto.numberDocument) {
        const userExists = await this.prisma.user.findUnique({
          where: { numberDocument: userDto.numberDocument },
          select: UserEntity,
        });

        if (userExists) {
          throw new ConflictException('El usuario ya existe');
        }
      }

      // Buscar o crear colegio
      const existingSchool = await this.prisma.school.findUnique({
        where: { name: school },
      });

      const schoolRecord = existingSchool
        ? existingSchool
        : await this.prisma.school.create({
          data: {
            name: school,
            createdById: userId,
          },
        });

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(userDto.email ?? 'withoutpassword', salt);

      return await this.prisma.user.create({
        data: {
          ...userDto,
          password: hashedPassword,
          student: {
            create: {
              code: `STU-${userDto.numberDocument}`,
              birthdate,
              gender,
              grade,
              educationLevel,
              tutors: {
                connect: tutorIds.map((userId) => ({ userId })),
              },
              schoolId: schoolRecord.id,
              createdById: userId,
            },
          },
        },
        select: UserEntity,
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


  async findAll(
    paginationDto: PaginationDto,
    caslFilter?: CaslFilterContext,
  ): Promise<PaginationResult<StudentType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;
      console.log('🎯 Filtro recibido desde CASL:', JSON.stringify(caslFilter, null, 2));

      const shouldIgnoreCasl =
        caslFilter?.subject === 'student' || caslFilter?.subject === 'tutor';

      const cleanedFilter = cleanCaslFilterForModel(caslFilter?.filter, 'student');


      const whereClause: Prisma.StudentWhereInput = {
        active: true,
        ...(caslFilter?.hasNoRestrictions || shouldIgnoreCasl ? {} : cleanedFilter ?? {}),
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

  async update(userId: string, id: string, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id); // Verificas que el estudiante existe

    const {
      birthdate,
      gender,
      school,
      grade,
      educationLevel,
      tutorIds,
      ...userDto
    } = updateStudentDto;
    if (!school) {
      throw new InternalServerErrorException('Es necesario el colegio');
    }
    // Buscar o crear colegio por nombre
    const existingSchool = await this.prisma.school.findUnique({
      where: { name: school },
    });

    const schoolRecord = existingSchool
      ? existingSchool
      : await this.prisma.school.create({
        data: {
          name: school,
          createdById: userId,
        },
      });

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
              code: `STU-${userDto.numberDocument}`,
              birthdate,
              gender,
              grade,
              educationLevel,
              tutors: {
                set: tutorIds?.map((userId) => ({ userId })) ?? [],
              },
              school: {
                connect: { id: schoolRecord.id },
              },
            },
          },
        },
      },
      select: UserEntity,
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
      select: UserEntity,
    });
  }
}