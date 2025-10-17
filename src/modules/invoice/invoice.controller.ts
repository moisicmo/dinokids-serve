import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { checkAbilities } from '@/decorator';
import { TypeAction, TypeSubject } from '@prisma/client';
import { PaginationDto } from '@/common';
import { AuthenticatedRequest } from '@/common/extended-request';

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
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.invoiceService.findAll(paginationDto, req.caslFilter);
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
