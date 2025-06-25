import { Module } from '@nestjs/common';
import { InscriptionService } from './inscription.service';
import { InscriptionController } from './inscription.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { CaslModule } from '@/casl/casl.module';
@Module({
  controllers: [InscriptionController],
  providers: [InscriptionService],
  imports: [PrismaModule,CaslModule],
})
export class InscriptionModule { }
