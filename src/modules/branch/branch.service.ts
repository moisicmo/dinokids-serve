import {  Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchEntity } from './entities/branch.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class BranchService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    return await this.prisma.branch.create({
      data: createBranchDto,
      select: BranchEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.branch.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.branch.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: BranchEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      select: BranchEntity,
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
      select: BranchEntity,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.branch.update({
      where: { id },
      data: { active: false },
      select: BranchEntity,
    });
  }
}
