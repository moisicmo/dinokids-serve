import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeSubject } from '@/common/enums';
import { TypeAction } from '@/generated/prisma/enums';
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.booking })
  create( @CurrentUser() user: JwtPayload, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(user.email,createBookingDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.booking })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.bookingService.findAllByBooking(paginationDto);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.booking })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.booking })
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}

