import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guard/auth.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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

import { GmailModule } from './common/gmail/gmail.module';
import { PdfModule } from './common/pdf/pdf.module';
import { XlsxModule } from './common/xlsx/xlsx.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { CorrespondenceModule } from './modules/correspondence/correspondence.module';
import { UserModule } from './modules/user/user.module';
import { PdfTemplateModule } from './modules/pdf-template/pdf-template.module';
@Module({
  imports: [
    NestScheduleModule.forRoot(),
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
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    PdfModule,
    XlsxModule,
    GmailModule,
    DebtModule,
    InvoiceModule,
    DashboardModule,
    ReportModule,
    AttendanceModule,
    CorrespondenceModule,
    UserModule,
    PdfTemplateModule,
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
