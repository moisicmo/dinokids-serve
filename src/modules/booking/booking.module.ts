import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [PrismaModule,CaslModule],
})
export class BookingModule { }
