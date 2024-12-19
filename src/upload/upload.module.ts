import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { PackagesModule } from 'src/packages/packages.module';

@Module({
  imports: [PackagesModule],
  controllers: [UploadController],
  providers: [UploadService]
})
export class UploadModule {}
