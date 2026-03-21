import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PdfTemplateService } from './pdf-template.service';
import { CreatePdfTemplateDto } from './dto/create-pdf-template.dto';
import { UpdatePdfTemplateDto } from './dto/update-pdf-template.dto';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from '@/generated/prisma/client';
import { TypeSubject } from '@/common/enums';
import type { JwtPayload } from '../auth/entities/jwt-payload.interface';

@Controller('pdf-template')
export class PdfTemplateController {
  constructor(private readonly pdfTemplateService: PdfTemplateService) {}

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.pdfTemplate })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePdfTemplateDto) {
    return this.pdfTemplateService.create(user.email, dto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.pdfTemplate })
  findAll(@Query('type') type?: string) {
    return this.pdfTemplateService.findAll(type);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.pdfTemplate })
  findOne(@Param('id') id: string) {
    return this.pdfTemplateService.findOne(id);
  }

  @Get(':id/preview')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.pdfTemplate })
  async preview(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.pdfTemplateService.generatePreview(id);
    res.set({
      'Content-Type': 'application/json',
    });
    return res.json({ pdfBase64: buffer.toString('base64') });
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.pdfTemplate })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePdfTemplateDto,
  ) {
    return this.pdfTemplateService.update(user.email, id, dto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.pdfTemplate })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.pdfTemplateService.remove(user.email, id);
  }
}
