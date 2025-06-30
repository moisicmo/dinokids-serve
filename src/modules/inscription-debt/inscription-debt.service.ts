import { Injectable } from '@nestjs/common';
import { CreateInscriptionDebtDto } from './dto/create-inscription-debt.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfService } from '@/common/pdf/pdf.service';
import { GoogledriveService } from '@/common/googledrive/googledrive.service';
import { PaginationDto } from '@/common';
import { InscriptionDebtSelect } from './entities/inscription-debt.entity';

@Injectable()
export class InscriptionDebtService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly googledriveService: GoogledriveService,
  ) { }

  create(createInscriptionDebtDto: CreateInscriptionDebtDto) {
    return 'This action adds a new inscriptionDebt';
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.inscriptionDebt.count({

    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.inscriptionDebt.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: InscriptionDebtSelect,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  findOne(id: string) {
    return `This action returns a #${id} inscriptionDebt`;
  }

  remove(id: string) {
    return `This action removes a #${id} inscriptionDebt`;
  }
}
