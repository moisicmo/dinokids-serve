import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateCartDto } from './dto/create-payment.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';

@UseGuards(AbilitiesGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('sendings')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.payment })
  create(@CurrentUser() user: JwtPayload, @Body() createPaymentDto: CreateCartDto) {
    return this.paymentService.create(user.id,createPaymentDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.payment })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.paymentService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.payment })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }
}

