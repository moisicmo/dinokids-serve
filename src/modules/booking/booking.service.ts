import {  Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingEntity } from './entities/booking.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class BookingService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    return await this.prisma.booking.create({
      data: createBookingDto,
      select: BookingEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.booking.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.booking.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: BookingEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      select: BookingEntity,
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id #${id} not found`);
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    await this.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      select: BookingEntity,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: { active: false },
      select: BookingEntity,
    });
  }
}
