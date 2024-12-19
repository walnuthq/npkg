import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { Package } from '../model/package.entity';
import { Version } from '../model/version.entity';
import { Download } from '../model/download.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Package, Version, Download])
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}