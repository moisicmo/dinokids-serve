import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { checkAbilities } from '@/decorator';
import { TypeAction } from '@/generated/prisma/client';
import { PaginationDto } from '@/common';
import { TypeSubject } from '@/common/enums';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.invoice })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.invoice })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.invoiceService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.invoice })
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.invoice })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.invoice })
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }
}
