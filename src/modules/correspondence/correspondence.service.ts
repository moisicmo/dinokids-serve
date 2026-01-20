import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCorrespondenceDto } from './dto/create-correspondence.dto';
import { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { DocumentTransmissionSelect, DocumentTransmissionType } from './entities/correspondence.entity';
import { PaginationDto, PaginationResult } from '@/common';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class CorrespondenceService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(user: JwtPayload, createCorrespondenceDto: CreateCorrespondenceDto) {
    try {
      const { ...correspondenceDto } = createCorrespondenceDto;
      const document = await this.prisma.document.create({
        data: {
          type: correspondenceDto.type,
          data: correspondenceDto.data,
          createdBy: user.email,
        }
      });
      return await this.prisma.documentTransmission.create({
        data: {
          documentId: document.id,
          senderId: user.id,
          receiverId: correspondenceDto.receiverId,
          createdBy: user.email,
        },
        select: DocumentTransmissionSelect,
      });

    } catch (error) {
      console.log(error);
      throw new Error(`No se pudo crear la correspondencia: ${error.message}`);
    }
  }

  async findAll( user: JwtPayload, paginationDto: PaginationDto): Promise<PaginationResult<DocumentTransmissionType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      // 🔹 Armar el filtro final para Prisma
      const whereClause: Prisma.DocumentTransmissionWhereInput = {
        receiverId: user.id,
      };

      // 🔹 Paginación
      const total = await this.prisma.documentTransmission.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      // 🔹 Consulta final con selección de campos
      const data = await this.prisma.documentTransmission.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: DocumentTransmissionSelect,
      });

      // 🔹 Retornar la respuesta formateada
      return {
        data,
        meta: { total, page, lastPage },
      };
    } catch (error) {
      console.error('❌ Error en findAll(Branch):', error);
      // Manejo de errores personalizado
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar las correspondencias');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} correspondence`;
  }
}
