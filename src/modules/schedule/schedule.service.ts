import {  Injectable, NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleEntity } from './entities/schedule.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class ScheduleService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    return await this.prisma.schedule.create({
      data: createScheduleDto,
      select: ScheduleEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.schedule.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.schedule.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: ScheduleEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
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
