import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateInscriptionDto } from './dto/update-inscription.dto';
import { InscriptionExtended, InscriptionSelect, InscriptionType } from './entities/inscription.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { PdfService } from '@/common/pdf/pdf.service';
import { GoogledriveService } from '@/common/googledrive/googledrive.service';
import { Prisma } from '@prisma/client';
import { addDays } from 'date-fns';
import { DayOfWeek } from '@prisma/client'; // Asegúrate de importar tu enum
import { CaslFilterContext } from '@/common/extended-request';

@Injectable()
export class InscriptionService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly googledriveService: GoogledriveService,
  ) { }

  async create(userId: string, createInscriptionDto: CreateInscriptionDto) {
    try {
      const { assignmentRooms, inscriptionPrice, monthPrice, ...inscriptionData } = createInscriptionDto;

      const result = await this.prisma.$transaction(async (tx) => {
        // 1️⃣ Crear inscripción
        const inscription = await tx.inscription.create({
          data: {
            createdById: userId,
            ...inscriptionData,
          },
        });

        console.log('✅ userId dentro de transacción:', userId);

        // 2️⃣ Crear precio
        await tx.price.create({
          data: {
            inscriptionId: inscription.id,
            inscriptionPrice,
            monthPrice,
            createdById: userId, // 👈 aquí sí se respeta dentro de la misma conexión
          },
        });

        // 3️⃣ Procesar salas
        for (const assignmentRoomDto of assignmentRooms ?? []) {
          const { assignmentSchedules, ...roomData } = assignmentRoomDto;

          const assignmentRoom = await tx.assignmentRoom.create({
            data: {
              inscriptionId: inscription.id,
              createdById: userId,
              ...roomData,
            },
          });

          const room = await tx.room.findUnique({
            where: { id: roomData.roomId },
            include: { specialty: { include: { branchSpecialties: true } } },
          });

          const numberSessions =
            room?.specialty.branchSpecialties[0]?.numberSessions ?? 1;

          for (const scheduleDto of assignmentSchedules ?? []) {
            const assignmentSchedule = await tx.assignmentSchedule.create({
              data: {
                assignmentRoomId: assignmentRoom.id,
                scheduleId: scheduleDto.schedule.id,
                day: scheduleDto.day,
                createdById: userId,
              },
            });

            // Crear sesiones
            const startDate = new Date(roomData.start);
            const sessionsToCreate: { date: Date; assignmentScheduleId: string }[] = [];
            let currentDate = new Date(startDate);

            while (sessionsToCreate.length < numberSessions) {
              const currentDay = currentDate.getDay();
              const mappedDay = mapDayOfWeek(scheduleDto.day);
              if (currentDay === mappedDay) {
                sessionsToCreate.push({
                  date: new Date(currentDate),
                  assignmentScheduleId: assignmentSchedule.id,
                });
              }
              currentDate = addDays(currentDate, 1);
            }

            await tx.session.createMany({
              data: sessionsToCreate.map((s) => ({
                assignmentScheduleId: s.assignmentScheduleId,
                date: s.date,
                createdById: userId,
              })),
            });
          }
        }

        return inscription;
      });



      // 7️⃣ Generar PDF y actualizar URL
      const finalInscription = await this.findOne(result.id);
      const pdfBuffer = await this.pdfService.generateInscription(finalInscription);
      const { webViewLink } = await this.googledriveService.uploadFile(
        `ins${finalInscription.id}.pdf`,
        pdfBuffer,
        'application/pdf',
        'inscripciones',
      );

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
  // async create(staffId: string, createInscriptionDto: CreateInscriptionDto) {
  //   try {
  //     const { assignmentRooms, inscriptionPrice, monthPrice, ...inscriptionData } = createInscriptionDto;

  //     const result = await this.prisma.$transaction(async (prisma) => {

  //       // 1. Crear la inscripción principal
  //       const inscription = await prisma.inscription.create({
  //         data: {
  //           staffId,
  //           ...inscriptionData,
  //         },
  //       });

  //       // 1.1 Crear el registro de precio

  //       await prisma.price.create({
  //         data: {
  //           inscriptionId: inscription.id,
  //           inscriptionPrice,
  //           monthPrice,
  //         }
  //       })

  //       // 2. Validar si hay salas asignadas
  //       if (assignmentRooms && assignmentRooms.length > 0) {
  //         for (const assignmentRoomDto of assignmentRooms) {
  //           const { assignmentSchedules, ...roomData } = assignmentRoomDto;

  //           // Crear la asignación de aula
  //           const assignmentRoom = await prisma.assignmentRoom.create({
  //             data: {
  //               inscriptionId: inscription.id,
  //               ...roomData,
  //             },
  //           });

  //           // Crear los horarios asociados
  //           if (assignmentSchedules && assignmentSchedules.length > 0) {
  //             for (const scheduleDto of assignmentSchedules) {
  //               await prisma.assignmentSchedule.create({
  //                 data: {
  //                   assignmentRoomId: assignmentRoom.id,
  //                   scheduleId: scheduleDto.schedule.id,
  //                   day: scheduleDto.day,
  //                 },
  //               });
  //             }
  //           }
  //         }
  //       }

  //       // 6. Retornar la inscripción final
  //       return inscription;
  //     });
  //     const finalInscription = await this.findOne(result.id);
  //     const pdfBuffer = await this.pdfService.generateInscription(finalInscription);
  //     const { webViewLink } = await this.googledriveService.uploadFile(`ins${finalInscription.id}.pdf`, pdfBuffer, 'application/pdf', 'inscripciones');
  //     // ver la opcion de sustituir por el this.update
  //     await this.prisma.inscription.update({
  //       where: { id: finalInscription.id },
  //       data: { url: webViewLink },
  //     });

  //     return {
  //       ...finalInscription,
  //       pdfBase64: pdfBuffer.toString('base64'),
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error(`No se pudo crear la inscripción: ${error.message}`);
  //   }

  // }


async findAllByStudent(
  paginationDto: PaginationDto,
  caslFilter?: CaslFilterContext,
): Promise<PaginationResult<InscriptionExtended>> {
  try {
    const { page = 1, limit = 10 } = paginationDto;

    // 🧩 1️⃣ Filtro base (solo inscripciones con estudiante y precios activos)
    const whereCustom: Prisma.InscriptionWhereInput = {
      student: { isNot: null },
      prices: { some: { active: true } },
    };

    // 🧠 2️⃣ Construir filtro adicional según CASL (sucursal del usuario)
    let branchFilter: Prisma.InscriptionWhereInput = {};
    if (caslFilter?.filter?.OR) {
      const branchCondition = caslFilter.filter.OR.find(
        (cond: any) => cond.id?.in,
      );

      if (branchCondition) {
        branchFilter = {
          assignmentRooms: {
            some: {
              room: {
                specialty: {
                  branchSpecialties: {
                    some: {
                      branchId: { in: branchCondition.id.in },
                    },
                  },
                },
              },
            },
          },
        };
      }
    }

    // 🧩 3️⃣ Fusionar filtros: CASL + personalizados
    const whereClause: Prisma.InscriptionWhereInput = {
      AND: [
        whereCustom,
        ...(caslFilter?.hasNoRestrictions ? [] : [branchFilter]),
      ],
    };

    // 🧩 4️⃣ Calcular total (paginación)
    const total = await this.prisma.inscription.count({ where: whereClause });
    const lastPage = Math.ceil(total / limit);

    // 🧩 5️⃣ Obtener inscripciones con sus relaciones necesarias
    const dataRaw = await this.prisma.inscription.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: InscriptionSelect
    });

    // 🧩 6️⃣ Extender resultado con precios activos
    const extendedData: InscriptionExtended[] = dataRaw.map((inscription) => {
      const activePrice = inscription.prices.find((p) => p.active);
      return {
        ...inscription,
        inscriptionPrice: activePrice?.inscriptionPrice ?? 0,
        monthPrice: activePrice?.monthPrice ?? 0,
      };
    });

    // 🧩 7️⃣ Retornar con metadatos
    return {
      data: extendedData,
      meta: { total, page, lastPage },
    };
  } catch (error) {
    console.error('❌ Error en findAllByStudent(Inscription):', error);
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException(
      'Hubo un error al listar las inscripciones por estudiante',
    );
  }
}






  async findAll(
    paginationDto: PaginationDto,
    whereCustom?: Prisma.InscriptionWhereInput,
    caslFilter?: CaslFilterContext,
  ): Promise<PaginationResult<InscriptionType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      // 🔹 1️⃣ Construimos el filtro base combinando CASL + filtros personalizados
      const whereClause: Prisma.InscriptionWhereInput = {
        active: true,
        ...(caslFilter?.hasNoRestrictions ? {} : caslFilter?.filter ?? {}),
        ...whereCustom,
        ...(keys.trim()
          ? {
            OR: [
              // 🔸 Buscar en Booking (nombre o DNI)
              {
                booking: {
                  OR: [
                    { name: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                    { dni: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                  ],
                },
              },
              // 🔸 Buscar en Student → User (nombre, apellido, email, doc)
              {
                student: {
                  user: {
                    OR: [
                      { name: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                      { lastName: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                      { email: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                      { numberDocument: { contains: keys, mode: Prisma.QueryMode.insensitive } },
                    ],
                  },
                },
              },
              // 🔸 Buscar en el nombre del aula (room)
              {
                assignmentRooms: {
                  some: {
                    room: {
                      name: { contains: keys, mode: Prisma.QueryMode.insensitive },
                    },
                  },
                },
              },
            ],
          }
          : {}),
      };

      // 🔹 2️⃣ Conteo y paginación
      const total = await this.prisma.inscription.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      // 🔹 3️⃣ Consulta principal
      const data = await this.prisma.inscription.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: InscriptionSelect,
      });

      // 🔹 4️⃣ Respuesta formateada
      return { data, meta: { total, page, lastPage } };
    } catch (error) {
      console.error('❌ Error en findAll(Inscription):', error);

      // Manejo coherente de errores
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar las inscripciones');
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

  async update(userId: string, id: string, updateInscriptionDto: UpdateInscriptionDto) {
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
              createdById: userId,
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
function mapDayOfWeek(day: DayOfWeek): number {
  const map: Record<DayOfWeek, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };
  return map[day];
}
