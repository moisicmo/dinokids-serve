import { Injectable } from '@nestjs/common';
import { InscriptionType } from '@/modules/inscription/entities/inscription.entity';
import { buildInscriptionTemplate } from './template/generate-inscription.template copy';
import { buildDebtTemplate } from './template/generate-debt.template';
import { DebtType } from '@/modules/debt/entities/debt.entity';

@Injectable()
export class XlsxService {

  constructor() { }


  async generateInscription(inscriptions: InscriptionType[]): Promise<Buffer> {
    const documentDefinition = await buildInscriptionTemplate(inscriptions);
    return documentDefinition;
  }

  async generateDebt(debts: DebtType[]): Promise<Buffer> {
    const documentDefinition = await buildDebtTemplate(debts);
    return documentDefinition;
  }


}
