import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { SpecialtySelect, SpecialtyType } from './entities/specialty.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';

@Injectable()
export class SpecialtyService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createSpecialtyDto: CreateSpecialtyDto) {
    const { name, numberSessions, estimatedSessionCost, branchId } = createSpecialtyDto;
    const specialty = await this.prisma.specialty.create({
      data: { name },
      select: SpecialtySelect,
    });
    await this.prisma.branchSpecialty.create({
      data: {
        branchId,
        specialtyId: specialty.id,
        estimatedSessionCost,
        numberSessions,
      }
    })

    return specialty;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<SpecialtyType>>  {
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
      const totalPages = await this.prisma.specialty.count({
        where: whereClause,
      });
      const lastPage = Math.ceil(totalPages / limit);
      return {
        data: await this.prisma.specialty.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereClause,
          orderBy: {
            createdAt: 'asc',
          },
          select: SpecialtySelect,
        }),
        meta: { total: totalPages, page, lastPage },
      };

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Hubo un error al pedir especialidades');
    }
  }

  async findAllBySpecialty(branchId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.specialty.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.specialty.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        active: true,
        branchSpecialties: {
          some: { branchId }
        }
      },
      select: SpecialtySelect,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }


  async findOne(id: string) {
    const specialty = await this.prisma.specialty.findUnique({
      where: { id },
      select: SpecialtySelect,
    });

    if (!specialty) {
      throw new NotFoundException(`Specialty with id #${id} not found`);
    }

    return specialty;
  }

  async update(id: string, updateSpecialtyDto: UpdateSpecialtyDto) {
    const { name, numberSessions, estimatedSessionCost, branchId } = updateSpecialtyDto;
    if (!branchId) {
      throw new BadRequestException('Es necesario el identificador de la sucursal');
    }
    await this.findOne(id);

    const specialty = await this.prisma.specialty.update({
      where: { id },
      data: { name },
      select: SpecialtySelect,
    });

    await this.prisma.branchSpecialty.update({
      where: {
        branchId_specialtyId: {
          branchId,
          specialtyId: id,
        },
      },
      data: {
        numberSessions,
        estimatedSessionCost,
      },
    });

    return specialty;
  }


  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.specialty.update({
      where: { id },
      data: { active: false },
      select: SpecialtySelect,
    });
  }
}
