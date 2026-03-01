import { Module } from '@nestjs/common';
import { CorrespondenceService } from './correspondence.service';
import { CorrespondenceController } from './correspondence.controller';
import { DocumentGateway } from './document.gateway';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CorrespondenceController],
  providers: [CorrespondenceService, DocumentGateway],
})
export class CorrespondenceModule {}
