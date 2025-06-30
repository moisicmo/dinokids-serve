import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
import { InscriptionModule } from '../inscription/inscription.module';
@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [PrismaModule,CaslModule,InscriptionModule],
})
export class BookingModule { }
