import * as bcrypt from 'bcrypt';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCorrespondenceDto } from './dto/create-correspondence.dto';
import { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { DocumentTransmissionSelect, DocumentTransmissionType, SentTransmissionSelect, SentTransmissionType } from './entities/correspondence.entity';
import { PaginationDto, PaginationResult } from '@/common';
import { Prisma } from '@/generated/prisma/client';

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

      // Auto-crear estudiante cuando el Evaluador envía un protocolo al Profesor
      const isProtocol = correspondenceDto.type !== EVALUATION_INIT_TYPE;
      if (isProtocol && correspondenceDto.childInfo?.length) {
        await this.autoCreateStudent(document.id, correspondenceDto.childInfo, user.email).catch((err) => {
          console.warn('⚠️ No se pudo auto-crear el estudiante:', err?.message);
        });
      }

      return transmission;
    } catch (error) {
      console.log(error);
      throw new Error(`No se pudo crear la correspondencia: ${error.message}`);
    }
  }

  private async autoCreateStudent(documentId: string, childInfo: any[], createdBy: string) {
    const get = (question: string): string =>
      (childInfo.find((q) => q.question === question)?.answer ?? '').toString().trim();

    const fullName = get('Nombre del niño');
    if (!fullName) return;

    const nameParts = fullName.split(' ');
    const name = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '-';

    // Birthdate: intentar parsear el texto libre
    const birthdateStr = get('Fecha de nacimiento');
    let birthdate: Date | null = null;
    if (birthdateStr) {
      const parsed = new Date(birthdateStr);
      if (!isNaN(parsed.getTime())) birthdate = parsed;
    }

    // Escuela
    const schoolName = get('Unidad educativa');
    let schoolId: string | undefined;
    if (schoolName) {
      const school = await this.prisma.school.upsert({
        where: { name: schoolName },
        update: {},
        create: { name: schoolName, createdBy },
      });
      schoolId = school.id;
    }

    // Grade / EducationLevel desde "Grado escolar" (ej: "3ro de Primaria", "Kinder")
    const gradeText = get('Grado escolar').toLowerCase();
    const gradeMatch = gradeText.match(/\d+/);
    const grade = gradeMatch ? parseInt(gradeMatch[0]) : undefined;

    // Crear usuario del estudiante (sin email, password temporal)
    const tempPassword = bcrypt.hashSync('DKids2024*', 10);
    const studentUser = await this.prisma.user.create({
      data: {
        name,
        lastName,
        phone: [],
        password: tempPassword,
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
        active: true,
        createdBy,
      },
    });

    // Crear tutor si hay datos
    const tutorFullName = get('Nombre del Tutor');
    const tutorPhone = get('Celular del Tutor');
    if (tutorFullName) {
      const tutorParts = tutorFullName.split(' ');
      const tutorUser = await this.prisma.user.create({
        data: {
          name: tutorParts[0],
          lastName: tutorParts.slice(1).join(' ') || '-',
          phone: tutorPhone ? [tutorPhone] : [],
          password: tempPassword,
          createdBy,
        },
      });
      await this.prisma.tutor.upsert({
        where: { userId: tutorUser.id },
        update: {
          students: { connect: [{ id: student.id }] },
        },
        create: {
          userId: tutorUser.id,
          active: true,
          students: { connect: [{ id: student.id }] },
          createdBy,
        },
      });
    }

    // Guardar el userId del estudiante en el Document para poder recuperarlo después
    await this.prisma.document.update({
      where: { id: documentId },
      data: { studentUserId: studentUser.id },
    });

    console.log(`✅ Estudiante pre-registrado: ${name} ${lastName} (code: ${code})`);
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

  findOne(id: number) {
    return `This action returns a #${id} correspondence`;
  }
}
