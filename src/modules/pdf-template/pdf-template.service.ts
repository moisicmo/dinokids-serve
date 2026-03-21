import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePdfTemplateDto } from './dto/create-pdf-template.dto';
import { UpdatePdfTemplateDto } from './dto/update-pdf-template.dto';
import { PdfTemplateSelect, PdfTemplateType } from './entities/pdf-template.entity';
import { PdfService } from '@/common/pdf/pdf.service';
import { InscriptionType } from '@/modules/inscription/entities/inscription.entity';

@Injectable()
export class PdfTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async create(email: string, dto: CreatePdfTemplateDto): Promise<PdfTemplateType> {
    // If marked as default, unset other defaults for the same type
    if (dto.isDefault) {
      await this.prisma.pdfTemplate.updateMany({
        where: { type: dto.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.pdfTemplate.create({
      data: {
        ...dto,
        isDefault: dto.isDefault ?? false,
        createdBy: email,
      },
      select: PdfTemplateSelect,
    });
  }

  async findAll(type?: string): Promise<PdfTemplateType[]> {
    return this.prisma.pdfTemplate.findMany({
      where: { active: true, ...(type ? { type } : {}) },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: PdfTemplateSelect,
    });
  }

  async findOne(id: string): Promise<PdfTemplateType> {
    const template = await this.prisma.pdfTemplate.findUnique({
      where: { id },
      select: PdfTemplateSelect,
    });
    if (!template) throw new NotFoundException(`Plantilla PDF #${id} no encontrada`);
    return template;
  }

  async findDefaultByType(type: string): Promise<PdfTemplateType | null> {
    return this.prisma.pdfTemplate.findFirst({
      where: { type, isDefault: true, active: true },
      select: PdfTemplateSelect,
    });
  }

  async update(email: string, id: string, dto: UpdatePdfTemplateDto): Promise<PdfTemplateType> {
    await this.findOne(id);

    if (dto.isDefault) {
      const current = await this.findOne(id);
      await this.prisma.pdfTemplate.updateMany({
        where: { type: dto.type ?? current.type, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.pdfTemplate.update({
      where: { id },
      data: { ...dto, updatedBy: email },
      select: PdfTemplateSelect,
    });
  }

  async remove(email: string, id: string): Promise<PdfTemplateType> {
    await this.findOne(id);
    return this.prisma.pdfTemplate.update({
      where: { id },
      data: { active: false, updatedBy: email },
      select: PdfTemplateSelect,
    });
  }

  /**
   * Generates a preview PDF from the template HTML with sample data.
   */
  async generatePreview(id: string): Promise<Buffer> {
    const template = await this.findOne(id);
    const sampleVars: Record<string, string> = {
      nombre_estudiante: 'Juan',
      apellido_estudiante: 'Pérez',
      nombre_completo_estudiante: 'Juan Pérez',
      ci_estudiante: '12345678',
      fecha_nacimiento: '15 de enero de 2018',
      nombre_tutor: 'María García',
      apellido_tutor: 'García',
      ci_tutor: '87654321',
      telefono_tutor: '70012345',
      direccion_tutor: 'La Paz, Miraflores, Av. Principal 123',
      fecha_contrato: new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }),
      sucursal_nombre: 'Sucursal Central',
    };
    const html = fillTemplateVariables(template.htmlContent, sampleVars);
    return this.pdfService.generateFromHtml(html);
  }

  /**
   * Generates a PDF from the template with actual inscription data.
   */
  async generateForInscription(inscription: InscriptionType): Promise<Buffer | null> {
    const template = await this.findDefaultByType('inscription');
    if (!template) return null;

    const tutor = inscription.student?.tutors?.[0];
    const address = tutor?.user?.address;
    const vars: Record<string, string> = {
      nombre_estudiante: inscription.student?.user.name ?? '',
      apellido_estudiante: inscription.student?.user.lastName ?? '',
      nombre_completo_estudiante: `${inscription.student?.user.name ?? ''} ${inscription.student?.user.lastName ?? ''}`.trim(),
      ci_estudiante: inscription.student?.user.numberDocument ?? '',
      fecha_nacimiento: inscription.student?.birthdate
        ? new Date(inscription.student.birthdate).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })
        : '',
      nombre_tutor: tutor ? `${tutor.user.name} ${tutor.user.lastName}` : '',
      apellido_tutor: tutor?.user.lastName ?? '',
      ci_tutor: tutor?.user.numberDocument ?? '',
      telefono_tutor: (tutor?.user.phone as string[])?.[0] ?? '',
      direccion_tutor: address
        ? `${address.city} ${address.zone} ${address.detail}`.trim()
        : '',
      fecha_contrato: new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }),
      sucursal_nombre: '',
    };

    const html = fillTemplateVariables(template.htmlContent, vars);
    return this.pdfService.generateFromHtml(html);
  }
}

export function fillTemplateVariables(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{([^}]+)\}\}/g, (_, key) => vars[key.trim()] ?? `{{${key.trim()}}}`);
}
