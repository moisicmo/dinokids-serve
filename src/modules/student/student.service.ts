import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, PaginationResult, UserEntity } from '@/common'; import { StudentSelect, StudentSelectType } from './entities/student.entity';
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

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<StudentSelectType>> {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.student.count({
      where: {
        active: true,
      },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.student.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          active: true,
        },
        select: StudentSelect,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string): Promise<StudentSelectType>  {
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