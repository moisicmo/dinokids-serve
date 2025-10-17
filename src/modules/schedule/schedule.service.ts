import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleEntity } from './entities/schedule.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { Prisma } from '@prisma/client';
import { CaslFilterContext } from '@/common/extended-request';

@Injectable()
export class ScheduleService {

  constructor(private readonly prisma: PrismaService) { }


  async findAll(
    paginationDto: PaginationDto,
    caslFilter?: CaslFilterContext,
  ) {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      // 🔹 Armar el filtro final para Prisma
      const whereClause: Prisma.ScheduleWhereInput = {
        active: true,
        ...(caslFilter?.hasNoRestrictions ? {} : caslFilter?.filter ?? {}),
        ...(keys
          ? {}
          : {}),
      };

      // 🔹 Paginación
      const total = await this.prisma.schedule.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);


      const data = await this.prisma.schedule.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: ScheduleEntity,
      });

      return { data, meta: { total, page, lastPage } };

    } catch (error) {
      console.error('❌ Error en findAll(Schedule):', error);

      // Manejo de errores más claro y consistente
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar schedule');
    }
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      select: ScheduleEntity,
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with id #${id} not found`);
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    await this.findOne(id);

    return this.prisma.schedule.update({
      where: { id },
      data: updateScheduleDto,
      select: ScheduleEntity,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.schedule.update({
      where: { id },
      data: { active: false },
      select: ScheduleEntity,
    });
  }
}
