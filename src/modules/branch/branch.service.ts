import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchSelect, BranchType } from './entities/branch.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';

@Injectable()
export class BranchService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createBranchDto: CreateBranchDto) {
    return await this.prisma.branch.create({
      data: createBranchDto,
      select: BranchSelect,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<BranchType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: any = {
        active: true,
      };

      if (keys.trim() !== '') {
        whereClause.OR = [
          { name: { contains: keys, mode: 'insensitive' } },
        ];
      }
      const totalPages = await this.prisma.branch.count({
        where: whereClause,
      });
      const lastPage = Math.ceil(totalPages / limit);
      return {
        data: await this.prisma.branch.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereClause,
          orderBy: {
            createdAt: 'asc',
          },
          select: BranchSelect,
        }),
        meta: { total: totalPages, page, lastPage },
      };

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Hubo un error al pedir sucursales');
    }
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      select: BranchSelect,
    });

    if (!branch) {
      throw new NotFoundException(`Branch with id #${id} not found`);
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    await this.findOne(id);

    return this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
      select: BranchSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.branch.update({
      where: { id },
      data: { active: false },
      select: BranchSelect,
    });
  }
}
