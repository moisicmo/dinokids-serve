import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateInscriptionDto } from './dto/update-inscription.dto';
import { InscriptionEntity } from './entities/inscription.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { InscriptionType } from '@prisma/client';

@Injectable()
export class InscriptionService {

  constructor(private readonly prisma: PrismaService) { }

  async create(staffId: string, createInscriptionDto: CreateInscriptionDto) {
    const { assignmentRooms, ...inscriptionData } = createInscriptionDto;

    const result = await this.prisma.$transaction(async (prisma) => {

      // 1. Crear la inscripción principal
      const inscription = await prisma.inscription.create({
        data: {
          staffId,
          inscriptionType: InscriptionType.Student,
          ...inscriptionData,
        },
      });

      // 2. Validar si hay salas asignadas
      if (assignmentRooms && assignmentRooms.length > 0) {
        for (const assignmentRoomDto of assignmentRooms) {

          const { assignmentSchedules, ...roomData } = assignmentRoomDto;

          // 3. Crear la sala asignada
          const assignmentRoom = await prisma.assignmentRoom.create({
            data: {
              inscriptionId: inscription.id,
              ...roomData,
            },
          });

          // 4. Validar si hay horarios para la sala
          if (assignmentSchedules && assignmentSchedules.length > 0) {
            for (const scheduleDto of assignmentSchedules) {

              // 5. Crear el horario para la sala
              await prisma.assignmentSchedule.create({
                data: {
                  assignmentRoomId: assignmentRoom.id,
                  ...scheduleDto,
                },
              });
            }
          }
        }
      }

      // 6. Retornar la inscripción final
      return inscription;
    });

    return result;
  }



  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.inscription.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.inscription.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: InscriptionEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const inscription = await this.prisma.inscription.findUnique({
      where: { id },
      select: InscriptionEntity,
    });

    if (!inscription) {
      throw new NotFoundException(`Inscription with id #${id} not found`);
    }

    return inscription;
  }

  async update(id: string, updateInscriptionDto: UpdateInscriptionDto) {
    const { assignmentRooms, ...inscriptionData } = updateInscriptionDto;

    // 1. Validar que exista
    await this.findOne(id);

    const result = await this.prisma.$transaction(async (prisma) => {

      // 2. Actualizar la inscripción principal
      const updatedInscription = await prisma.inscription.update({
        where: { id },
        data: inscriptionData,
        select: InscriptionEntity,
      });

      // 3. Eliminar relaciones anteriores (según el caso)
      await prisma.assignmentSchedule.deleteMany({
        where: {
          assignmentRoom: {
            inscriptionId: id,
          },
        },
      });

      await prisma.assignmentRoom.deleteMany({
        where: {
          inscriptionId: id,
        },
      });

      // 4. Insertar nuevas asignaciones si existen
      if (assignmentRooms && assignmentRooms.length > 0) {
        for (const assignmentRoomDto of assignmentRooms) {

          const { assignmentSchedules, ...roomData } = assignmentRoomDto;

          // 4.1 Crear la sala asignada
          const assignmentRoom = await prisma.assignmentRoom.create({
            data: {
              inscriptionId: id,
              ...roomData,
            },
          });

          // 4.2 Crear los horarios si existen
          if (assignmentSchedules && assignmentSchedules.length > 0) {
            for (const scheduleDto of assignmentSchedules) {
              await prisma.assignmentSchedule.create({
                data: {
                  assignmentRoomId: assignmentRoom.id,
                  ...scheduleDto,
                },
              });
            }
          }
        }
      }

      // 5. Retornar la inscripción actualizada
      return updatedInscription;
    });

    return result;
  }


  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.inscription.update({
      where: { id },
      data: { active: false },
      select: InscriptionEntity,
    });
  }
}
