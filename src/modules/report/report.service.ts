import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { XlsxService } from '@/common/xlsx/xlsx.service';
import { InscriptionService } from '../inscription/inscription.service';
import { DebtService } from '../debt/debt.service';
import { PaginationDto } from '@/common';

@Injectable()
export class ReportService {

  constructor(
    private readonly xlsxService: XlsxService,
    private readonly inscriptionService: InscriptionService,
    private readonly debtService: DebtService,
  ) { }

  async getInscriptionsInDocumentXlsx(paginationDto: PaginationDto) {
    try {
      const inscriptions = await this.inscriptionService.findAll(paginationDto, {});
      const xlsxBuffer = await this.xlsxService.generateInscription(inscriptions.data);
      return {
        xlsxBase64: xlsxBuffer.toString('base64'),
      };

    } catch (error) {
      console.error('❌ Error en getInscriptionsInDocumentXlsx(report):', error);
      // Manejo de errores personalizado
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al pedir inscripciones en xlsx');
    }
  }

  async getDebsInDocumentXlsx(paginationDto: PaginationDto) {
    try {
      const debts = await this.debtService.findAll(paginationDto);
      const xlsxBuffer = await this.xlsxService.generateDebt(debts.data);
      return {
        xlsxBase64: xlsxBuffer.toString('base64'),
      };

    } catch (error) {
      console.error('❌ Error en getDebsInDocumentXlsx(report):', error);
      // Manejo de errores personalizado
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al pedir deudas en xlsx');

    }
  }
}
