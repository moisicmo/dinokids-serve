import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateCartDto } from './dto/create-payment.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser, RequestInfo } from '@/decorator';
import { TypeAction } from "@/generated/prisma/client";
import type { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/enums';
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('sendings')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.payment })
  create(@CurrentUser() user: JwtPayload, @Body() createPaymentDto: CreateCartDto) {
    return this.paymentService.create(user.email, createPaymentDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.payment })
  findAll(@Query() paginationDto: PaginationDto, @RequestInfo() requestInfo: RequestInfo) {
    return this.paymentService.findAll(paginationDto, requestInfo.branchSelect);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.payment })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }
}

