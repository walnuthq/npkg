import { 
  Controller, 
  Get, 
  Param, 
  StreamableFile, 
  NotFoundException, Res
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Package } from '../model/package.entity';
import { Response } from 'express';
import * as stream from 'stream';

@Controller('api/v1/packages')
export class PackagesController {
  constructor(private readonly em: EntityManager) {}

  @Get(':name/:version')
  async getPackage(@Param('name') name: string, @Param('version') version: string) {
    const [major, minor, patch] = version.split('.').map(Number);

    const pkg = await this.em.findOne(Package, { name }, { populate: ['versions'] });
    if (!pkg) {
      throw new NotFoundException(`Package "${name}" not found`);
    }

    const ver = pkg.versions.getItems().find(
      v => v.major === major && v.minor === minor && v.patch === patch,
    );

    if (!ver) {
      throw new NotFoundException(`Version "${version}" not found for package "${name}"`);
    }

    return {
      name: pkg.name,
      version: ver.versionNumber,
      size_kb: ver.sizeKb,
      readme: pkg.readme,
      created_at: ver.createdAt,
      tag_name: pkg.tagName,
    };
  }

  @Get(':name/:version/download')
  async downloadPackage(
    @Param('name') name: string,
    @Param('version') version: string,
    @Res() res: Response,
  ) {
    const [major, minor, patch] = version.split('.').map(Number);

    const pkg = await this.em.findOne(Package, { name }, { populate: ['versions'] });
    if (!pkg) {
      throw new NotFoundException(`Package "${name}" not found`);
    }

    const ver = pkg.versions.getItems().find(
      v => v.major === major && v.minor === minor && v.patch === patch,
    );

    if (!ver) {
      throw new NotFoundException(`Version "${version}" not found for package "${name}"`);
    }

    const buffer = Buffer.from(ver.packageBlob, 'base64');

    const fileStream = new stream.PassThrough();
    fileStream.end(buffer);

    const fileName = `${name}-${version}.tar.gz`; 
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length, 
    });

    fileStream.pipe(res);
  }

  
}
