import {  Injectable, NotFoundException } from '@nestjs/common';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { UpdateInscriptionDto } from './dto/update-inscription.dto';
import { InscriptionEntity } from './entities/inscription.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class InscriptionService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createInscriptionDto: CreateInscriptionDto) {
    return await this.prisma.inscription.create({
      data: createInscriptionDto,
      select: InscriptionEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.inscription.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.inscription.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: InscriptionEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const inscription = await this.prisma.inscription.findUnique({
      where: { id },
      select: InscriptionEntity,
    });

    if (!inscription) {
      throw new NotFoundException(`Inscription with id #${id} not found`);
    }

    return inscription;
  }

  async update(id: string, updateInscriptionDto: UpdateInscriptionDto) {
    await this.findOne(id);

    return this.prisma.inscription.update({
      where: { id },
      data: updateInscriptionDto,
      select: InscriptionEntity,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.inscription.update({
      where: { id },
      data: { active: false },
      select: InscriptionEntity,
    });
  }
}
