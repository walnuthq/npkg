import { Controller, Post, UseInterceptors, UploadedFile, Res, HttpStatus, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { PackagesService } from '../packages/packages.service';

@Controller('api/v1/upload')
export class UploadController {
  private readonly uploadPath = process.env.REGISTRY_PATH ?? path.join(__dirname, '..', 'noir_registry');

  constructor(private readonly packagesService: PackagesService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res) {
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'File is required.' });
    }

    const filePath = path.join(this.uploadPath, file.originalname);

    try {
      console.log('Checking upload directory:', this.uploadPath);
      if (!fs.existsSync(this.uploadPath)) {
        console.log('Directory does not exist. Creating...');
        fs.mkdirSync(this.uploadPath, { recursive: true });
      }


      console.log('Saving file to:', filePath);
      fs.writeFileSync(filePath, file.buffer);

    
      const [name, version] = file.originalname.split('_');
      if (!name || !version) {
        throw new Error('Invalid file name format. Use "name_major.minor.patch.ext".');
      }

      const versionMatch = version.match(/^(\d+)\.(\d+)\.(\d+)/);
      if (!versionMatch) {
        throw new Error('Invalid version format. Use "major.minor.patch".');
      }

      const [major, minor, patch] = versionMatch.slice(1).map(Number);
      const sortableVersion = `${major}.${minor}.${patch}`.padStart(12, '0');

 
      const packageBlob = file.buffer.toString('base64');
      const sizeKb = Math.round(file.buffer.length / 1024);

      console.log('Saving package and version to the database...');
      const pkg = await this.packagesService.findOrCreatePackage(name);
      const newVersion = await this.packagesService.addVersion(pkg.id, {
        major,
        minor,
        patch,
        sortableVersion,
        versionNumber: `${major}.${minor}.${patch}`,
        packageBlob,
        sizeKb,
      });
      console.log('File uploaded and processed successfully.');
      return res.status(HttpStatus.OK).json({
        message: 'File uploaded successfully',
        package: pkg.name,
        version: newVersion.versionNumber,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error uploading file',
        error: error.message,
      });
    }
  }
    @Get()
    getAllPackages(@Res() res) {
        const dirPath = path.join(this.uploadPath);

        // Check if the directory exists
        if (!fs.existsSync(dirPath)) {
            return res.status(404).json({ message: 'No packages found' });
        }

        // Read all files in the directory
        const files = fs.readdirSync(dirPath);
        const packages = files.map((file) => {
            // Extract package name and version
            const match = file.match(/^(.*)_(\d+\.\d+\.\d+)/);
            if (match) {
                const name = match[1]; // Package name
                const version = match[2]; // Package version

                // Get the file size in KB
                const fileSizeInBytes = fs.statSync(path.join(dirPath, file)).size;
                const sizeInKB = (fileSizeInBytes / 1024).toFixed(2); // Convert to KB

                return {
                    name,
                    version,
                    size: `${sizeInKB} KB`,
                };
            }
            return null; // Return null if the file doesn't match the expected pattern
        }).filter(pkg => pkg !== null); // Filter out any null entries

        return res.json(packages);
    }
}
