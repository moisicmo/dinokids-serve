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
import { GmailModule } from './common/gmail/gmail.module';
import { PdfModule } from './common/pdf/pdf.module';
import { XlsxModule } from './common/xlsx/xlsx.module';
import { CityModule } from './modules/city/city.module';
@Module({
  imports: [
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
    GmailModule,
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
