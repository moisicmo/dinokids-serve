import * as bcrypt from 'bcrypt';
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateCorrespondenceDto } from './dto/create-correspondence.dto';
import { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AdminSentTransmissionSelect, AdminSentTransmissionType, DocumentTransmissionSelect, DocumentTransmissionType, SentTransmissionSelect, SentTransmissionType } from './entities/correspondence.entity';
import { PaginationDto, PaginationResult } from '@/common';
import { Gender, EducationLevel, Prisma } from '@/generated/prisma/client';

const EVALUATION_INIT_TYPE = 'Asignación de Evaluación';

@Injectable()
export class CorrespondenceService {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(user: JwtPayload, createCorrespondenceDto: CreateCorrespondenceDto) {
    try {
      const { ...correspondenceDto } = createCorrespondenceDto;
      const document = await this.prisma.document.create({
        data: {
          type: correspondenceDto.type,
          data: correspondenceDto.data,
          ...(correspondenceDto.childInfo ? { childInfo: correspondenceDto.childInfo } : {}),
          createdBy: user.email,
        }
      });

      const transmission = await this.prisma.documentTransmission.create({
        data: {
          documentId: document.id,
          senderId: user.id,
          receiverId: correspondenceDto.receiverId,
          createdBy: user.email,
        },
        select: DocumentTransmissionSelect,
      });

      // Vincular estudiante al documento
      const isProtocol = correspondenceDto.type !== EVALUATION_INIT_TYPE;
      if (isProtocol && correspondenceDto.childInfo?.length) {
        // Resolver studentUserId: prop directa > documento fuente > auto-crear
        let resolvedStudentUserId = correspondenceDto.studentUserId;

        if (!resolvedStudentUserId && correspondenceDto.sourceDocumentId) {
          const sourceDoc = await this.prisma.document.findUnique({
            where: { id: correspondenceDto.sourceDocumentId },
            select: { studentUserId: true },
          });
          resolvedStudentUserId = sourceDoc?.studentUserId ?? undefined;
        }

        if (resolvedStudentUserId) {
          // Estudiante ya existe → solo enlazar al nuevo documento
          await this.prisma.document.update({
            where: { id: document.id },
            data: { studentUserId: resolvedStudentUserId },
          });
        } else {
          // Primer protocolo → crear estudiante y guardarlo también en el documento fuente
          await this.autoCreateStudent(
            document.id,
            correspondenceDto.childInfo,
            user.email,
            correspondenceDto.sourceDocumentId,
          ).catch((err) => {
            console.warn('⚠️ No se pudo auto-crear el estudiante:', err?.message);
          });
        }
      }

      return transmission;
    } catch (error) {
      console.log(error);
      throw new Error(`No se pudo crear la correspondencia: ${error.message}`);
    }
  }

  private async autoCreateStudent(documentId: string, childInfo: any[], createdBy: string, sourceDocumentId?: string) {
    const get = (question: string): string =>
      (childInfo.find((q) => q.question === question)?.answer ?? '').toString().trim();

    const saveDocuments = async (studentUserId: string) => {
      const ids = [documentId, ...(sourceDocumentId ? [sourceDocumentId] : [])];
      await Promise.all(ids.map((id) =>
        this.prisma.document.update({ where: { id }, data: { studentUserId } }),
      ));
    };

    // ── Nombre del estudiante (campos nuevos + fallback legacy) ──
    const name = get('Nombre') || get('Nombre del niño').split(' ')[0];
    if (!name) return;
    const apellidoField = get('Apellido');
    const lastName = apellidoField || (() => {
      const parts = get('Nombre del niño').split(' ');
      return parts.slice(1).join(' ') || '-';
    })();

    const studentCi = get('CI Estudiante');

    // ── Dedup por CI del estudiante ──────────────────────────────
    if (studentCi) {
      const existing = await this.prisma.user.findFirst({
        where: { numberDocument: studentCi },
        select: { id: true },
      });
      if (existing) {
        await saveDocuments(existing.id);
        console.log(`♻️ Estudiante existente reutilizado (CI: ${studentCi})`);
        return;
      }
    }

    // ── Parsear birthdate ────────────────────────────────────────
    const birthdateStr = get('Fecha de nacimiento');
    let birthdate: Date | null = null;
    if (birthdateStr) {
      const parsed = new Date(birthdateStr);
      if (!isNaN(parsed.getTime())) birthdate = parsed;
    }

    // ── Escuela ──────────────────────────────────────────────────
    const schoolName = get('Unidad educativa');
    let schoolId: string | undefined;
    if (schoolName) {
      const school = await this.prisma.school.upsert({
        where: { name: schoolName }, update: {}, create: { name: schoolName, createdBy },
      });
      schoolId = school.id;
    }

    // ── Grado ────────────────────────────────────────────────────
    const gradeText = get('Grado escolar').toLowerCase();
    const gradeMatch = gradeText.match(/\d+/);
    const grade = gradeMatch ? parseInt(gradeMatch[0]) : undefined;

    // ── Género ───────────────────────────────────────────────────
    const generoRaw = get('Género').toLowerCase();
    const gender = generoRaw === 'masculino' ? Gender.MASCULINO
      : generoRaw === 'femenino' ? Gender.FEMENINO
      : undefined;

    // ── Nivel educativo ──────────────────────────────────────────
    const nivelRaw = get('Nivel educativo').toLowerCase();
    const educationLevel = nivelRaw === 'primaria' ? EducationLevel.PRIMARIA
      : nivelRaw === 'secundaria' ? EducationLevel.SECUNDARIA
      : undefined;

    // ── Crear usuario del estudiante ─────────────────────────────
    const tempPassword = bcrypt.hashSync('DKids2024*', 10);
    const studentUser = await this.prisma.user.create({
      data: {
        name,
        lastName,
        phone: [],
        password: tempPassword,
        ...(studentCi ? { numberDocument: studentCi } : {}),
        createdBy,
      },
    });

    const code = `STU-${Date.now()}`;
    const student = await this.prisma.student.create({
      data: {
        userId: studentUser.id,
        code,
        ...(birthdate ? { birthdate } : {}),
        ...(grade ? { grade } : {}),
        ...(schoolId ? { schoolId } : {}),
        ...(gender ? { gender } : {}),
        ...(educationLevel ? { educationLevel } : {}),
        active: true,
        createdBy,
      },
    });

    // ── Tutor ─────────────────────────────────────────────────────
    const tutorName = get('Nombre del Tutor');
    const tutorLastName = get('Apellido del Tutor') || tutorName.split(' ').slice(1).join(' ') || '-';
    const tutorFirstName = get('Nombre del Tutor').split(' ')[0] || tutorName;
    const tutorCi = get('CI Tutor');
    const tutorPhone = get('Celular del Tutor');
    const tutorEmail = get('Email del Tutor') || undefined;

    if (tutorName) {
      // Dedup tutor por CI
      if (tutorCi) {
        const existingTutor = await this.prisma.user.findFirst({
          where: { numberDocument: tutorCi },
          select: { id: true, tutor: { select: { id: true } } },
        });
        if (existingTutor?.tutor) {
          await this.prisma.tutor.update({
            where: { userId: existingTutor.id },
            data: { students: { connect: { id: student.id } } },
          });
          console.log(`♻️ Tutor existente reutilizado (CI: ${tutorCi})`);
          await saveDocuments(studentUser.id);
          console.log(`✅ Estudiante creado: ${name} ${lastName} (code: ${code})`);
          return;
        }
      }

      // Crear nuevo usuario tutor
      const tutorUser = await this.prisma.user.create({
        data: {
          name: tutorFirstName,
          lastName: tutorLastName,
          phone: tutorPhone ? [tutorPhone] : [],
          ...(tutorEmail ? { email: tutorEmail } : {}),
          ...(tutorCi ? { numberDocument: tutorCi } : {}),
          password: tempPassword,
          createdBy,
        },
      });
      await this.prisma.tutor.upsert({
        where: { userId: tutorUser.id },
        update: { students: { connect: [{ id: student.id }] } },
        create: { userId: tutorUser.id, active: true, students: { connect: [{ id: student.id }] }, createdBy },
      });
    }

    // ── Guardar studentUserId en documentos ───────────────────────
    await saveDocuments(studentUser.id);
    console.log(`✅ Estudiante creado: ${name} ${lastName} (code: ${code})`);
  }

  async findAll(user: JwtPayload, paginationDto: PaginationDto): Promise<PaginationResult<DocumentTransmissionType>> {
    try {
      const { page = 1, limit = 10, keys = '' } = paginationDto;

      const whereClause: Prisma.DocumentTransmissionWhereInput = {
        receiverId: user.id,
      };

      const total = await this.prisma.documentTransmission.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      const data = await this.prisma.documentTransmission.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        select: DocumentTransmissionSelect,
      });

      return {
        data,
        meta: { total, page, lastPage },
      };
    } catch (error) {
      console.error('❌ Error en findAll(Correspondence):', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Hubo un error al listar las correspondencias');
    }
  }

  async findSent(user: JwtPayload, paginationDto: PaginationDto): Promise<PaginationResult<SentTransmissionType>> {
    try {
      const { page = 1, limit = 10 } = paginationDto;

      const whereClause: Prisma.DocumentTransmissionWhereInput = {
        senderId: user.id,
      };

      const total = await this.prisma.documentTransmission.count({ where: whereClause });
      const lastPage = Math.ceil(total / limit);

      const data = await this.prisma.documentTransmission.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: SentTransmissionSelect,
      });

      return { data, meta: { total, page, lastPage } };
    } catch (error) {
      console.error('❌ Error en findSent(Correspondence):', error);
      throw new InternalServerErrorException('Hubo un error al listar los enviados');
    }
  }

  async findAllSent(paginationDto: PaginationDto): Promise<PaginationResult<AdminSentTransmissionType>> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const total = await this.prisma.documentTransmission.count();
      const lastPage = Math.ceil(total / limit);
      const data = await this.prisma.documentTransmission.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: AdminSentTransmissionSelect,
      });
      return { data, meta: { total, page, lastPage } };
    } catch (error) {
      console.error('❌ Error en findAllSent:', error);
      throw new InternalServerErrorException('Hubo un error al listar el historial global');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} correspondence`;
  }

  // ── Draft (Informe borrador) ──────────────────────────────────────────────

  async getDraft(studentUserId: string) {
    return this.prisma.document.findFirst({
      where: { type: 'INFORME_BORRADOR', studentUserId },
      select: { id: true, data: true },
    });
  }

  async saveDraft(studentUserId: string, content: string, createdBy: string) {
    const existing = await this.prisma.document.findFirst({
      where: { type: 'INFORME_BORRADOR', studentUserId },
    });
    const data = [{ type: 'html', content }] as any;
    if (existing) {
      return this.prisma.document.update({
        where: { id: existing.id },
        data: { data },
      });
    }
    return this.prisma.document.create({
      data: { type: 'INFORME_BORRADOR', data, studentUserId, createdBy },
    });
  }

  async clearDraft(studentUserId: string) {
    await this.prisma.document.deleteMany({
      where: { type: 'INFORME_BORRADOR', studentUserId },
    });
  }

  private readonly logger = new Logger(CorrespondenceService.name);

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanOldDocumentData() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const result = await this.prisma.document.updateMany({
      where: { createdAt: { lt: cutoff } },
      data: { data: [] },
    });

    this.logger.log(`🧹 Limpieza diaria: ${result.count} documentos vaciados (>30 días)`);
  }
}
