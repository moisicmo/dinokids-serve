import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomSelect, RoomType } from './entities/room.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { ScheduleService } from '../schedule/schedule.service';
import { Prisma } from '@prisma/client';
import { CaslFilterContext } from '@/common/extended-request';

@Injectable()
export class RoomService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduleService: ScheduleService,
  ) { }

  async create(userId: string, createRoomDto: CreateRoomDto) {
    const { schedules, ...roomDto } = createRoomDto;

    const result = await this.prisma.$transaction(async (prisma) => {
      const room = await prisma.room.create({
        data: {
          createdById: userId,
          ...roomDto,
        },
        select: RoomSelect,
      });

      if (schedules && schedules.length > 0) {
        await Promise.all(
          schedules.map(schedule =>
            prisma.schedule.create({
              data: {
                roomId: room.id,
                createdById: userId,
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

  async findAll(
    paginationDto: PaginationDto,
    caslFilter?: CaslFilterContext,
  ): Promise<PaginationResult<RoomType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      console.log('🎯 CASL filter recibido (Room):', JSON.stringify(caslFilter, null, 2));

      // 🧠 Construcción del filtro por sucursal (branch)
      let branchFilter: Prisma.RoomWhereInput = {};
      if (caslFilter?.filter?.OR) {
        const branchCondition = caslFilter.filter.OR.find((cond: any) => cond.id?.in);
        if (branchCondition) {
          branchFilter = {
            specialty: {
              branchSpecialties: {
                some: {
                  branchId: { in: branchCondition.id.in }, // ✅ conexión indirecta
                },
              },
            },
          };
        }
      }

      // 🔹 Armar el filtro final para Prisma
      const whereClause: Prisma.RoomWhereInput = {
        active: true,
        ...(caslFilter?.hasNoRestrictions ? {} : branchFilter),
        ...(keys
          ? {
            OR: [
              { name: { contains: keys, mode: Prisma.QueryMode.insensitive } },
              { specialty: { name: { contains: keys, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
          : {}),
      };

      console.log('🧩 Filtro final RoomWhereInput:', JSON.stringify(whereClause, null, 2));

      // 🔹 Paginación
      const total = await this.prisma.room.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      // 🔹 Consulta principal
      const rawData = await this.prisma.room.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: RoomSelect,
      });

      // 🔹 Post-procesar (filtrar schedules activos)
      const data = rawData.map((room) => ({
        ...room,
        schedules: room.schedules?.filter((s) => s.active),
      }));

      // 🔹 Retornar la respuesta formateada
      return { data, meta: { total, page, lastPage } };

    } catch (error) {
      console.error('❌ Error en findAll(Room):', error);

      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar las aulas');
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

  async update(userId: string, id: string, updateRoomDto: UpdateRoomDto) {
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
              day: schedule.day,
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
              day: schedule.day!,
              start: schedule.start,
              end: schedule.end,
              capacity: schedule.capacity!,
              createdById: userId,
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
