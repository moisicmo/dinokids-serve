import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { XlsxService } from '@/common/xlsx/xlsx.service';
import { InscriptionService } from '../inscription/inscription.service';
import { DebtService } from '../debt/debt.service';
import { ReportDto } from './dto/report.dto';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class ReportService {

  constructor(
    private readonly xlsxService: XlsxService,
    private readonly inscriptionService: InscriptionService,
    private readonly debtService: DebtService,
  ) { }

  private buildDateFilter(startDate?: string, endDate?: string): { createdAt?: Prisma.DateTimeFilter } {
    if (!startDate || !endDate) return {};
    return {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(`${endDate}T23:59:59`),
      },
    };
  }

  async getInscriptionsInDocumentXlsx(reportDto: ReportDto) {
    try {
      const { startDate, endDate, ...paginationDto } = reportDto;
      const whereCustom = this.buildDateFilter(startDate, endDate);
      const inscriptions = await this.inscriptionService.findAll(paginationDto, whereCustom);
      const xlsxBuffer = await this.xlsxService.generateInscription(inscriptions.data);
      return {
        xlsxBase64: xlsxBuffer.toString('base64'),
        data: inscriptions.data,
      };
    } catch (error) {
      console.error('❌ Error en getInscriptionsInDocumentXlsx(report):', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al pedir inscripciones en xlsx');
    }
  }

  async getDebsInDocumentXlsx(reportDto: ReportDto) {
    try {
      const { startDate, endDate, ...paginationDto } = reportDto;
      const whereCustom = this.buildDateFilter(startDate, endDate);
      const debts = await this.debtService.findAll(paginationDto, whereCustom);
      const xlsxBuffer = await this.xlsxService.generateDebt(debts.data);
      return {
        xlsxBase64: xlsxBuffer.toString('base64'),
        data: debts.data,
      };
    } catch (error) {
      console.error('❌ Error en getDebsInDocumentXlsx(report):', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al pedir deudas en xlsx');
    }
  }
}
