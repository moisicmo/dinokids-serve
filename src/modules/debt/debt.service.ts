import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { DebtSelect, DebtType } from './entities/debt.entity';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class DebtService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async findAll(paginationDto: PaginationDto, whereCustom?: Prisma.DebtsWhereInput) {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      // 🔹 Armar el filtro final para Prisma
      const whereClause: Prisma.DebtsWhereInput = {
        ...whereCustom,
      };

      const totalPages = await this.prisma.debts.count({ where: whereClause });
      const lastPage = Math.ceil(totalPages / limit);

      const data = await this.prisma.debts.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: DebtSelect,
      });

      return {
        data,
        meta: { total: totalPages, page, lastPage },
      };

    } catch (error) {
      console.error('❌ Error en findAll(debt):', error);
      // Manejo de errores personalizado
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar las deudas');
    }
  }

  async findAllByStudent(
    studentId: string,
    paginationDto: PaginationDto
  ): Promise<PaginationResult<DebtType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      // 🔹 Armar el filtro final para Prisma
      const whereClause: Prisma.DebtsWhereInput = {
        ...(keys ? {
          inscription: { studentId }
        } : {
          inscription: { studentId }
        }),
      };


      const total = await this.prisma.debts.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      const data = await this.prisma.debts.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: DebtSelect,
      });

      return {
        data,
        meta: { total, page, lastPage },
      };
    } catch (error) {
      console.error('❌ Error en findAll by student(debt):', error);
      // Manejo de errores personalizado
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar las deudas de un estudiante');
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
