import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { XlsxService } from '@/common/xlsx/xlsx.service';
import { InscriptionSelect } from '../inscription/entities/inscription.entity';
import { DebtSelect } from '../debt/entities/debt.entity';

@Injectable()
export class ReportService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly xlsxService: XlsxService,
  ) { }

  async getInscriptionsInDocumentXlsx() {

    const inscriptions = await this.prisma.inscription.findMany({
      select: InscriptionSelect,
    });
    const xlsxBuffer = await this.xlsxService.generateInscription(inscriptions);
    return {
      xlsxBase64: xlsxBuffer.toString('base64'),
    };
  }

  async getDebsInDocumentXlsx() {
    const debts = await this.prisma.debts.findMany({
      select: DebtSelect,
    });
    const xlsxBuffer = await this.xlsxService.generateDebt(debts);
    return {
      xlsxBase64: xlsxBuffer.toString('base64'),
    };
  }
}
