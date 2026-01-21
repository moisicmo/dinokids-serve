import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { BranchSpecialtyType, BranchSpecialtySelect, SpecialtySelect } from './entities/specialty.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginationResult } from '@/common';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class SpecialtyService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(email: string, createSpecialtyDto: CreateSpecialtyDto) {
    const { name, numberSessions, estimatedSessionCost, branchId } = createSpecialtyDto;
    const specialty = await this.prisma.specialty.create({
      data: {
        name,
        createdBy: email,
      },
      select: SpecialtySelect,
    });
    const branchSpecialty = await this.prisma.branchSpecialty.create({
      data: {
        branchId,
        specialtyId: specialty.id,
        estimatedSessionCost,
        numberSessions,
        createdBy: email,
      }
    })
    return branchSpecialty;
  }

  async findAll(paginationDto: PaginationDto, branchSelect: string): Promise<PaginationResult<BranchSpecialtyType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      // 🔹 Armar el filtro final para Prisma
      const whereClause: Prisma.BranchSpecialtyWhereInput = {
        active: true,
        branchId: branchSelect,
        ...(keys
          ? {
            OR: [
              { specialty: { name: { contains: keys, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
          : {}),
      };
      // 🔹 Paginación
      const total = await this.prisma.branchSpecialty.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      // 🔹 Consulta principal
      const data = await this.prisma.branchSpecialty.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: BranchSpecialtySelect,
      });

      return { data, meta: { total, page, lastPage } };
    } catch (error) {
      console.error('❌ Error en findAll(Specialty):', error);

      // Manejo de errores más claro y consistente
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar las especialidades');
    }
  }




  async findAllBySpecialty(branchId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.specialty.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.branchSpecialty.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        active: true,
        branchId: branchId
      },
      select: BranchSpecialtySelect,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }


  async findOne(id: string) {
    const specialty = await this.prisma.branchSpecialty.findUnique({
      where: { id },
      select: BranchSpecialtySelect,
    });

    if (!specialty) {
      throw new NotFoundException(`Specialty with id #${id} not found`);
    }

    return specialty;
  }

async update(
  id: string, // ← branchSpecialty.id
  updateSpecialtyDto: UpdateSpecialtyDto,
  email: string,
) {
  const { name, numberSessions, estimatedSessionCost } =
    updateSpecialtyDto;

  // 1️⃣ Obtener la relación con la especialidad
  const branchSpecialty = await this.prisma.branchSpecialty.findUnique({
    where: { id },
    include: { specialty: true },
  });

  if (!branchSpecialty) {
    throw new NotFoundException('Especialidad no encontrada en la sucursal');
  }

  return this.prisma.$transaction(async (tx) => {
    // 2️⃣ Actualizar SPECIALTY (nombre)
    const specialty = await tx.specialty.update({
      where: { id: branchSpecialty.specialtyId },
      data: {
        ...(name && { name }),
        updatedBy: email,
      },
    });

    // 3️⃣ Actualizar BRANCH_SPECIALTY
    const updatedBranchSpecialty = await tx.branchSpecialty.update({
      where: { id },
      data: {
        ...(numberSessions !== undefined && { numberSessions }),
        ...(estimatedSessionCost !== undefined && {
          estimatedSessionCost,
        }),
        updatedBy: email,
      },
    });

    return {
      specialty,
      branchSpecialty: updatedBranchSpecialty,
    };
  });
}




  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.branchSpecialty.update({
      where: { id },
      data: { active: false },
      select: BranchSpecialtySelect,
    });
  }
}
