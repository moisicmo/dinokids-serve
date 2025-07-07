import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PaginationDto, PaginationResult } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { InvoiceSelect, InvoiceType } from './entities/invoice.entity';

@Injectable()
export class InvoiceService {

  constructor(private readonly prisma: PrismaService) { }

  create(createInvoiceDto: CreateInvoiceDto) {
    return 'This action adds a new invoice';
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<InvoiceType>> {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.invoice.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.invoice.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: InvoiceSelect,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
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
