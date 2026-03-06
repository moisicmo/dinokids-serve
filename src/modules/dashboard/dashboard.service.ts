import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DebtSelect } from '../debt/entities/debt.entity';

@Injectable()
export class DashboardService {

  constructor(private readonly prisma: PrismaService) { }

  async findAll(branchSelect: string) {
    const totalStudents = await this.prisma.student.count({
      where: { active: true },
    });
    const totalTeachers = await this.prisma.teacher.count({
      where: {
        active: true,
        branches: {
          some: { id: branchSelect }
        }
      },
    });
    const totalDebts = await this.prisma.debts.count({
      where: {
        remainingBalance: { gt: 0 },
        inscription: {
          assignmentRooms: {
            some: {
              room: {
                branchId: branchSelect
              }
            }
          },
        }
      },
    });

    const totalPayments = await this.prisma.payment.count({
      where: { active: true },
    });

    const inscriptions = await this.prisma.inscription.findMany({
      where: {
        active: true,
        assignmentRooms: {
          some: {
            room: {
              branchId: branchSelect
            }
          }
        },
      },
      select: { createdAt: true },
    });

    const debts = await this.prisma.debts.findMany({
      where: {
        remainingBalance: { gt: 0 },
      },
      orderBy: {
        dueDate: 'asc'
      },
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
        totalDebts,
        totalPayments,
      },
      inscriptionsData,
      debts,
    };
  }

  async findAllBranches() {
    const branches = await this.prisma.branch.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        address: {
          select: {
            city: true,
            zone: true,
            detail: true,
          }
        },
        phone: true,
      }
    });

    const metricsByBranch = await Promise.all(
      branches.map(async (branch) => {
        const totalStudents = await this.prisma.student.count({
          where: { active: true, branchId: branch.id },
        });
        const totalTeachers = await this.prisma.teacher.count({
          where: {
            active: true,
            branches: {
              some: { id: branch.id }
            }
          },
        });
        const totalDebts = await this.prisma.debts.count({
          where: {
            remainingBalance: { gt: 0 },
            inscription: {
              assignmentRooms: {
                some: {
                  room: {
                    branchId: branch.id
                  }
                }
              },
            }
          },
        });
        const totalPayments = await this.prisma.payment.count({
          where: { active: true },
        });

        const inscriptions = await this.prisma.inscription.findMany({
          where: {
            active: true,
            assignmentRooms: {
              some: {
                room: {
                  branchId: branch.id
                }
              }
            },
          },
          select: { createdAt: true },
        });

        const debts = await this.prisma.debts.findMany({
          where: {
            remainingBalance: { gt: 0 },
            inscription: {
              assignmentRooms: {
                some: {
                  room: {
                    branchId: branch.id
                  }
                }
              },
            }
          },
          orderBy: {
            dueDate: 'asc'
          },
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
          branch: {
            id: branch.id,
            name: branch.name,
            address: branch.address,
            phone: branch.phone,
          },
          metrics: {
            totalBranches: 1,
            totalStudents,
            totalTeachers,
            totalDebts,
            totalPayments,
          },
          inscriptionsData,
          debts,
        };
      })
    );

    return metricsByBranch;
  }

}
