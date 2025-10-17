import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CityService {

  constructor(private readonly prisma: PrismaService) { }

  async create(userId: string, name: string) {
    const city = await this.prisma.city.create({
      data: {
        name,
        createdById: userId,
      }
    });
    return city;
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: any = {};

      if (keys.trim() !== '') {
        whereClause.OR = [
          { name: { contains: keys, mode: 'insensitive' } },
        ];
      }
      const totalPages = await this.prisma.city.count({
        where: whereClause,
      });
      const lastPage = Math.ceil(totalPages / limit);
      return {
        data: await this.prisma.city.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: whereClause,
        }),
        meta: { total: totalPages, page, lastPage },
      };

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Hubo un error al pedir ciudades');
    }
  }
}
