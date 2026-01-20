import { Module } from '@nestjs/common';
import { CorrespondenceService } from './correspondence.service';
import { CorrespondenceController } from './correspondence.controller';

@Module({
  controllers: [CorrespondenceController],
  providers: [CorrespondenceService],
})
export class CorrespondenceModule {}
