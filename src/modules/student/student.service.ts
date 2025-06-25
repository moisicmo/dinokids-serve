import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, UserEntity } from '@/common'; @Injectable()

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

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.user.count({
      where: {
        student: {
          // isNot: null,
          active: true,
        },
      },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          student: {
            // isNot: null,
            active: true,
          },
        },
        select: UserEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        student: {
          isNot: null,
        },
      },
      select: UserEntity,
    });

    if (!user) {
      throw new NotFoundException(`Student with id #${id} not found`);
    }

    return user;
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