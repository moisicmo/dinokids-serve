import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { DebtSelect, DebtType } from './entities/debt.entity';

@Injectable()
export class DebtService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.debts.count({

    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.debts.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: DebtSelect,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findAllByStudent(studentId: string, paginationDto: PaginationDto): Promise<PaginationResult<DebtType>> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const totalPages = await this.prisma.debts.count({
        where: {
          inscription: { studentId },
        },
      });
      const lastPage = Math.ceil(totalPages / limit);

      const data = await this.prisma.debts.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          inscription: { studentId },
        },
        select: DebtSelect,
      });

      return {
        data,
        meta: { total: totalPages, page, lastPage },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al obtener deudas de un estudiante');
    }
  }

  async findOne(id: string): Promise<DebtType> {
    try {
      const debt = await this.prisma.debts.findUnique({
        where: { id },
        select: DebtSelect,
      });

      if (!debt) {
        throw new NotFoundException(`Branch with id #${id} not found`);
      }

      return debt;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al obtener la deuda');
    }
  }

  remove(id: string) {
    return `This action removes a #${id} debt`;
  }
}
