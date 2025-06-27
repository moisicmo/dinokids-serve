import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomEntity } from './entities/room.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class RoomService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createRoomDto: CreateRoomDto) {
    const { schedules, ...roomDto } = createRoomDto;

    const result = await this.prisma.$transaction(async (prisma) => {
      const room = await prisma.room.create({
        data: roomDto,
        select: RoomEntity,
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



  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.room.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.room.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: RoomEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      select: RoomEntity,
    });

    if (!room) {
      throw new NotFoundException(`Room with id #${id} not found`);
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const { schedules, ...roomDto } = updateRoomDto;

    await this.findOne(id); 

    const room = await this.prisma.room.update({
      where: { id },
      data: roomDto,
      select: RoomEntity,
    });

    if (schedules) {
      await this.prisma.schedule.deleteMany({
        where: { roomId: id },
      });

      if (schedules.length > 0) {
        await Promise.all(
          schedules.map(schedule =>
            this.prisma.schedule.create({
              data: {
                roomId: room.id,
                ...schedule,
              },
            })
          )
        );
      }
    }

    return room;
  }


  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.room.update({
      where: { id },
      data: { active: false },
      select: RoomEntity,
    });
  }
}
