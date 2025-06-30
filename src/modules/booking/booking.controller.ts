import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';

@UseGuards(AbilitiesGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.booking })
  create( @CurrentUser() user: JwtPayload, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(user.id,createBookingDto);
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

