import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomSelect, RoomType } from './entities/room.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { ScheduleService } from '../schedule/schedule.service';

@Injectable()
export class RoomService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduleService: ScheduleService,
  ) { }

  async create(createRoomDto: CreateRoomDto) {
    const { schedules, ...roomDto } = createRoomDto;

    const result = await this.prisma.$transaction(async (prisma) => {
      const room = await prisma.room.create({
        data: roomDto,
        select: RoomSelect,
      });

      if (schedules && schedules.length > 0) {
        await Promise.all(
          schedules.map(schedule =>
            prisma.schedule.create({
              data: {
                roomId: room.id,
                ...schedule,
              },
            })
          )
        );
      }

      return room;
    });

    return result;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<RoomType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: any = {
        active: true,
      };

      if (keys.trim() !== '') {
        whereClause.OR = [
          {
            name: { contains: keys, mode: 'insensitive' }
          },
          {
            specialty: {
              name: { contains: keys, mode: 'insensitive' }
            }
          },
        ];
      }
      const totalPages = await this.prisma.room.count({
        where: whereClause,
      });
      const lastPage = Math.ceil(totalPages / limit);
      const rawData = await this.prisma.room.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: {
          createdAt: 'asc',
        },
        select: RoomSelect,
      });

      // ✅ filtramos los schedules activos manualmente
      const filteredData = rawData.map((room) => ({
        ...room,
        schedules: room.schedules?.filter((s) => s.active),
      }));
      return {
        data: filteredData,
        meta: {
          total: totalPages,
          page,
          lastPage,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Hubo un error al pedir aulas');
    }

  }


  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      select: RoomSelect,
    });

    if (!room) {
      throw new NotFoundException(`Room with id #${id} not found`);
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const { schedules = [], ...roomDto } = updateRoomDto;

    await this.findOne(id);

    const room = await this.prisma.room.update({
      where: { id },
      data: roomDto,
      select: RoomSelect,
    });

    // 🔹 Buscar todos los horarios actuales de esta sala
    const existingSchedules = await this.prisma.schedule.findMany({
      where: { roomId: id },
      select: { id: true },
    });

    const incomingIds = schedules
      .filter(s => !!s.id)
      .map(s => s.id);

    // 🔹 Eliminar horarios que ya no vienen en el DTO
    const toDelete = existingSchedules.filter(
      s => !incomingIds.includes(s.id)
    );

    await Promise.all(
      toDelete.map((item) =>
        this.scheduleService.remove(item.id)
      )
    );

    // 🔹 Procesar los nuevos horarios
    await Promise.all(
      schedules.map(schedule => {
        if (schedule.id) {
          // ✅ Update si viene con ID
          return this.prisma.schedule.update({
            where: { id: schedule.id },
            data: {
              days: schedule.days,
              start: schedule.start,
              end: schedule.end,
              // active: schedule.active ?? true,
            },
          });
        } else {
          // ➕ Create si no tiene ID
          return this.prisma.schedule.create({
            data: {
              roomId: room.id,
              days: schedule.days,
              start: schedule.start,
              end: schedule.end,
              // active: schedule.active ?? true,
            },
          });
        }
      })
    );

    return room;
  }



  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.room.update({
      where: { id },
      data: { active: false },
      select: RoomSelect,
    });
  }
}
