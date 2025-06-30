import { Module } from '@nestjs/common';
import { GoogledriveService } from './googledrive.service';

@Module({
  providers: [GoogledriveService],
  exports: [GoogledriveService],
})
export class GoogledriveModule {}
