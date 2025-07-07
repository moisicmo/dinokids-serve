import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateInscriptionDto } from './dto/update-inscription.dto';
import { InscriptionExtended, InscriptionSelect, InscriptionType } from './entities/inscription.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { PdfService } from '@/common/pdf/pdf.service';
import { GoogledriveService } from '@/common/googledrive/googledrive.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InscriptionService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly googledriveService: GoogledriveService,
  ) { }

  async create(staffId: string, createInscriptionDto: CreateInscriptionDto) {
    try {
      const { assignmentRooms, inscriptionPrice, monthPrice, ...inscriptionData } = createInscriptionDto;

      const result = await this.prisma.$transaction(async (prisma) => {

        // 1. Crear la inscripción principal
        const inscription = await prisma.inscription.create({
          data: {
            staffId,
            ...inscriptionData,
          },
        });

        // 1.1 Crear el registro de precio

        await prisma.price.create({
          data: {
            inscriptionId: inscription.id,
            inscriptionPrice,
            monthPrice,
          }
        })

        // 2. Validar si hay salas asignadas
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

        // 6. Retornar la inscripción final
        return inscription;
      });
      const finalInscription = await this.findOne(result.id);
      const pdfBuffer = await this.pdfService.generateInscription(finalInscription);
      const { webViewLink } = await this.googledriveService.uploadFile(`ins${finalInscription.id}.pdf`, pdfBuffer, 'application/pdf', 'inscripciones');
      // ver la opcion de sustituir por el this.update
      await this.prisma.inscription.update({
        where: { id: finalInscription.id },
        data: { url: webViewLink },
      });

      return {
        ...finalInscription,
        pdfBase64: pdfBuffer.toString('base64'),
      };
    } catch (error) {
      console.log(error);
      throw new Error(`No se pudo crear la inscripción: ${error.message}`);
    }

  }


  async findAllByStudent(paginationDto: PaginationDto): Promise<PaginationResult<InscriptionExtended>> {
    try {
      const inscriptionsByStudent = await this.findAll(paginationDto, {
        student: { isNot: null },
        prices: {
          some: {
            active: true,
          },
        },
      });

      const extendedData: InscriptionExtended[] = inscriptionsByStudent.data.map(inscription => {
        const activePrice = inscription.prices.find(p => p.active);
        return {
          ...inscription,
          inscriptionPrice: activePrice?.inscriptionPrice ?? 0,
          monthPrice: activePrice?.monthPrice ?? 0,
        };
      });

      return {
        data: extendedData,
        meta: inscriptionsByStudent.meta,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error retrieving inscriptions');
    }
  }



  async findAll(
    paginationDto: PaginationDto,
    whereCustom?: Prisma.InscriptionWhereInput,
  ): Promise<PaginationResult<InscriptionType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: Prisma.InscriptionWhereInput = {
        active: true,
        ...whereCustom,
      };

      if (keys.trim() !== '') {
        whereClause.OR = [
          // {
          //   code: { contains: keys, mode: 'insensitive' },
          // },
          {
            student: {
              user: {
                OR: [
                  { name: { contains: keys, mode: 'insensitive' } },
                  { lastName: { contains: keys, mode: 'insensitive' } },
                  { email: { contains: keys, mode: 'insensitive' } },
                  { numberDocument: { contains: keys, mode: 'insensitive' } },
                ],
              },
            },
          },
          // {
          //   room: {
          //     name: { contains: keys, mode: 'insensitive' },
          //   },
          // },
        ];
      }

      const total = await this.prisma.inscription.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      const data = await this.prisma.inscription.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        select: InscriptionSelect,
      });

      return {
        data,
        meta: {
          total,
          page,
          lastPage,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Hubo un error al pedir inscripciones');
    }
  }



  async findPdf(id: string) {
    try {
      const finalInscription = await this.findOne(id);
      if (!finalInscription.url) {
        throw new NotFoundException(`No URL found for inscription with id ${id}`);
      }
      const pdfBase64 = await this.googledriveService.getFileBase64ByUrl(finalInscription.url);
      if (!pdfBase64) {
        throw new InternalServerErrorException('Unable to retrieve PDF content from Google Drive');
      }

      return {
        pdfBase64,
      };
    } catch (error) {
      if (error.getStatus && error.getResponse) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Error retrieving inscription PDF');
    }
  }


  async findOne(id: string): Promise<InscriptionType> {
    const inscription = await this.prisma.inscription.findUnique({
      where: { id },
      select: InscriptionSelect,
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
        select: InscriptionSelect,
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
          // if (assignmentSchedules && assignmentSchedules.length > 0) {
          //   for (const scheduleDto of assignmentSchedules) {
          //     await prisma.assignmentSchedule.create({
          //       data: {
          //         assignmentRoomId: assignmentRoom.id,
          //         ...scheduleDto,
          //       },
          //     });
          //   }
          // }
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
      select: InscriptionSelect,
    });
  }
}
