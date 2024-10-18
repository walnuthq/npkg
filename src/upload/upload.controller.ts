import { Controller, Post, UseInterceptors, UploadedFile, Res, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/v1')
export class UploadController {

    private readonly uploadPath = process.env.REGISTRY_PATH ?? path.join(__dirname, '..', `noir_registry`);
    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res) {
        try {
            // Ensure the directory exists
            if (!fs.existsSync(this.uploadPath)) {
                fs.mkdirSync(this.uploadPath, { recursive: true });
            }

            // Save the file using a writable stream
            const filePath = path.join(this.uploadPath, `${file.originalname}`);
            const writeStream = fs.createWriteStream(filePath);

            // Write the file in chunks to avoid issues with large files
            writeStream.write(file.buffer);
            writeStream.end();  // Ensure stream is closed after writing is complete

            writeStream.on('finish', () => {
                console.log('File successfully saved:', filePath);
            });

            writeStream.on('error', (error) => {
                console.error('Error writing file:', error);
                return res.status(500).json({
                    message: 'Error saving file',
                    error: error.message,
                });
            });

            return res.json({
                message: 'File uploaded successfully',
                file: file.originalname,
            });

        } catch (error) {
            console.error('Error uploading file:', error);
            return res.status(500).json({
                message: 'Error uploading file',
                error: error.message,
            });
        }
    }

    @Get('/:name/:version')
    getFile(@Param('name') packageName: string, @Param('version') version: string, @Res() res) {
        const filePath = path.join(this.uploadPath, `${packageName}_${version}`);

        // Check if the file exists
        if (fs.existsSync(filePath)) {
            console.log(`File found: ${filePath}`);
            res.sendFile(filePath, { headers: { 'Content-Disposition': `attachment; filename="${packageName}"` } });
        } else {
            console.log(`File not found: ${filePath}`);
            return res.status(404).json({ message: 'File not found' });
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
