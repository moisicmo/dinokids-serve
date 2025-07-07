import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserEntity } from '@/common'; import { StudentSelect, StudentType } from './entities/student.entity';
@Injectable()

export class StudentService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createStudentDto: CreateStudentDto) {
    const { birthdate, gender, school, grade, educationLevel, tutorIds, ...userDto } = createStudentDto;

    const userExists = await this.prisma.user.findUnique({
      where: { numberDocument: userDto.numberDocument },
      select: UserEntity,
    });

    if (userExists) {
      throw new Error('El usuario ya existe');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userDto.email, salt);

    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        student: {
          create: {
            code: `STU-${userDto.numberDocument}`,
            birthdate,
            gender,
            school,
            grade,
            educationLevel,
            tutors: {
              connect: tutorIds.map(userId => ({ userId })),
            }
          },
        },
        ...userDto,
      },
      select: UserEntity,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<StudentType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: any = {
        active: true,
      };

      if (keys.trim() !== '') {
        whereClause.OR = [
          {
            user: {
              OR: [
                { name: { contains: keys, mode: 'insensitive' } },
                { lastName: { contains: keys, mode: 'insensitive' } },
                { email: { contains: keys, mode: 'insensitive' } },
                { numberDocument: { contains: keys, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }
      const totalPages = await this.prisma.student.count({
        where: whereClause,
      });
      const lastPage = Math.ceil(totalPages / limit);
      return {
        data: await this.prisma.student.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereClause,
          orderBy: {
            createdAt: 'asc',
          },
          select: StudentSelect,
        }),
        meta: { total: totalPages, page, lastPage },
      };

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Hubo un error al pedir estudiantes');
    }
  }

  async findOne(id: string): Promise<StudentType>  {
    const student = await this.prisma.student.findUnique({
      where: { userId : id},
      select: StudentSelect,
    });

    if (!student) {
      throw new NotFoundException(`Student with id #${id} not found`);
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);
    const { birthdate, gender, school, grade, educationLevel, tutorIds, ...userDto } = updateStudentDto;

    return this.prisma.user.update({
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
              code: `STU-${userDto.numberDocument}`,
              birthdate,
              gender,
              school,
              grade,
              educationLevel,
              tutors: {
                set: tutorIds?.map(userId => ({ userId })) ?? [],
              },
            },
          },
        },
        ...userDto,
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