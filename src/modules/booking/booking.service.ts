import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingEntity } from './entities/booking.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { InscriptionService } from '../inscription/inscription.service';
import { InscriptionType } from '../inscription/entities/inscription.entity';
import { PdfService } from '@/common/pdf/pdf.service';
import { GoogledriveService } from '@/common/googledrive/googledrive.service';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class BookingService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly inscriptionService: InscriptionService,

    private readonly invoiceService: InvoiceService,
    private readonly pdfService: PdfService,
    private readonly googledriveService: GoogledriveService,
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


      const invoice = await this.prisma.invoice.findFirst({
        where: {
          payments: {
            some: {
              debt: {
                inscriptionId: finalInscription.id,
              },
            },
          },
        },
      });
      if (!invoice) {
        throw new Error('No se encontró una factura asociada a la reserva.');
      }

      const finalInvoice = await this.invoiceService.findOne(invoice.id);

      const pdfBuffer = await this.pdfService.generateInvoiceRoll(finalInvoice);
      const { webViewLink } = await this.googledriveService.uploadFile(
        `res${finalInvoice.id}.pdf`,
        pdfBuffer,
        'application/pdf',
        'comprobantes'
      );

      await this.prisma.invoice.update({
        where: { id: finalInvoice.id },
        data: { url: webViewLink },
      });
      return {
        finalInscription,
        finalInvoice,
        pdfBase64: pdfBuffer.toString('base64'),
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
