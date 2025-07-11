import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guard/auth.guard';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { StaffModule } from './modules/staff/staff.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { BranchModule } from './modules/branch/branch.module';
import { AuthModule } from './modules/auth/auth.module';
import { StudentModule } from './modules/student/student.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { TutorModule } from './modules/tutor/tutor.module';
import { RoomModule } from './modules/room/room.module';
import { SpecialtyModule } from './modules/specialty/specialty.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { BookingModule } from './modules/booking/booking.module';
import { InscriptionModule } from './modules/inscription/inscription.module';
import { DebtModule } from './modules/debt/debt.module';
import { PaymentModule } from './modules/payment/payment.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportModule } from './modules/report/report.module';

import { GoogledriveModule } from './common/googledrive/googledrive.module';
import { PdfModule } from './common/pdf/pdf.module';
import { XlsxModule } from './common/xlsx/xlsx.module';
import { CityModule } from './modules/city/city.module';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, // Hace que ConfigService esté disponible en toda la app
      validationSchema: joi.object({
        PORT: joi.number().required(),
        JWT_SECRET: joi.string().required(),
        CLOUDINARY_CLOUD_NAME: joi.string().required(),
        CLOUDINARY_API_KEY: joi.string().required(),
        CLOUDINARY_API_SECRET: joi.string().required(),
        GOOGLEDRIVE_CLIENT_ID: joi.string().required(),
        GOOGLEDRIVE_CLIENT_SECRET: joi.string().required(),
        GOOGLEDRIVE_REDIRECT_URI: joi.string().required(),
        GOOGLEDRIVE_ACCESS_TOKEN: joi.string().required(),
        GOOGLEDRIVE_REFRESH_TOKEN: joi.string().required(),
      }),
      // ignoreEnvFile: true, // Descomenta esto en producción (Railway)
    }),
    PrismaModule,
    AuthModule,
    BranchModule,
    PermissionModule,
    RoleModule,
    StaffModule,
    StudentModule,
    TeacherModule,
    TutorModule,
    RoomModule,
    SpecialtyModule,
    ScheduleModule,
    InscriptionModule,
    BookingModule,
    PaymentModule,
    CloudinaryModule,
    PdfModule,
    XlsxModule,
    GoogledriveModule,
    DebtModule,
    InvoiceModule,
    DashboardModule,
    ReportModule,
    CityModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
