import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PaginationDto, PaginationResult } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { InvoiceSelect, InvoiceType } from './entities/invoice.entity';
import { CaslFilterContext } from '@/common/extended-request';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoiceService {

  constructor(private readonly prisma: PrismaService) { }

  create(createInvoiceDto: CreateInvoiceDto) {
    return 'This action adds a new invoice';
  }

  async findAll(
    paginationDto: PaginationDto,
    caslFilter?: CaslFilterContext,
  ): Promise<PaginationResult<InvoiceType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: Prisma.InvoiceWhereInput = {
        active: true,
        ...(caslFilter?.hasNoRestrictions ? {} : caslFilter?.filter ?? {}),
        ...(keys
          ? {}
          : {}),
      };

      const total = await this.prisma.invoice.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      const data = await this.prisma.invoice.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: InvoiceSelect,
      });

      return { data, meta: { total, page, lastPage } };

    } catch (error) {
      console.error('❌ Error en findAll(Invoice):', error);

      // Manejo de errores más claro y consistente
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar las facturas');
    }
  }

  async findOne(id: string): Promise<InvoiceType> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      select: InvoiceSelect,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with id #${id} not found`);
    }

    return invoice;
  }

  update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    return `This action updates a #${id} invoice`;
  }

  remove(id: string) {
    return `This action removes a #${id} invoice`;
  }
}
