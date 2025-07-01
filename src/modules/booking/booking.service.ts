import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingEntity } from './entities/booking.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { InscriptionService } from '../inscription/inscription.service';
import { InscriptionType } from '../inscription/entities/inscription.entity';

@Injectable()
export class BookingService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly inscriptionService: InscriptionService,
  ) { }

  async create(staffId: string, createBookingDto: CreateBookingDto) {
    try {
      const { assignmentRooms, ...bookingDto } = createBookingDto;

      const result = await this.prisma.$transaction(async (prisma) => {

        // 1. Crear la reserva 
        const booking = await prisma.booking.create({
          data: bookingDto,
          select: BookingEntity,
        });
        // 2. Crear la inscripción en modo reserva

        const inscription = await prisma.inscription.create({
          data: {
            staffId,
            bookingId: booking.id,
          },
        });

        // 3. Validar si hay salas asignadas
        if (assignmentRooms && assignmentRooms.length > 0) {
          for (const assignmentRoomDto of assignmentRooms) {
            const { assignmentSchedules, ...roomData } = assignmentRoomDto;

            // Crear la asignación de aula
            const assignmentRoom = await prisma.assignmentRoom.create({
              data: {
                inscriptionId: inscription.id,
                ...roomData,
              },
            });

            // Crear los horarios asociados
            if (assignmentSchedules && assignmentSchedules.length > 0) {
              for (const scheduleDto of assignmentSchedules) {
                await prisma.assignmentSchedule.create({
                  data: {
                    assignmentRoomId: assignmentRoom.id,
                    scheduleId: scheduleDto.schedule.id,
                    day: scheduleDto.day,
                  },
                });
              }
            }
          }
        }

        // 7. Retornar la inscripción final
        return inscription;
      });

      const finalInscription = await this.inscriptionService.findOne(result.id);

      return {
        ...finalInscription,
      };
    } catch (error) {
      console.log(error);
      throw new Error(`No se pudo crear la reserva: ${error.message}`);
    }
  }

  async findAllByBooking(paginationDto: PaginationDto): Promise<PaginationResult<InscriptionType>> {
    try {
      const inscriptionsByBooking = await this.inscriptionService.findAll(paginationDto, {
        booking: { isNot: null },
      });

      return inscriptionsByBooking;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error retrieving inscriptions');
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    await this.inscriptionService.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      select: BookingEntity,
    });
  }

  async remove(id: string) {
    await this.inscriptionService.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: { active: false },
      select: BookingEntity,
    });
  }
}
