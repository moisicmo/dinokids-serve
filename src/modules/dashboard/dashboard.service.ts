import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DebtSelect } from '../debt/entities/debt.entity';

@Injectable()
export class DashboardService {

  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    const totalStudents = await this.prisma.student.count({
      where: { active: true },
    });
    const totalTeachers = await this.prisma.teacher.count({
      where: { active: true },
    });
    const totalBranches = await this.prisma.branch.count({
      where: { active: true },
    });
    const totalDebts = await this.prisma.debts.count();
    const totalPayments = await this.prisma.payment.count({
      where: { active: true },
    });

    const inscriptions = await this.prisma.inscription.findMany({
      select: { createdAt: true },
    });

    const debts = await this.prisma.debts.findMany({
      select: DebtSelect
    });

    // Procesar inscripciones por mes
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const countByMonth: Record<number, number> = {};

    inscriptions.forEach((inscription) => {
      const month = new Date(inscription.createdAt).getMonth(); // 0 - 11
      countByMonth[month] = (countByMonth[month] || 0) + 1;
    });

    const inscriptionsData = months.map((m, i) => ({
      month: m,
      count: countByMonth[i] || 0,
    }));

    return {
      metrics: {
        totalStudents,
        totalTeachers,
        totalBranches,
        totalDebts,
        totalPayments,
      },
      inscriptionsData,
      debts,
    };
  }

}
