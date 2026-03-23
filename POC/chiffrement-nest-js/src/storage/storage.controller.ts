import { Controller, Get, Post, Delete, UploadedFile, UseInterceptors, Res, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from './storage.service';
import { Response } from 'express';

@Controller()
export class StorageController {
  constructor(private service: StorageService) {}

  @Get()
  home(@Res() res: Response) {
    return res.sendFile('index.html', { root: 'public' });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const name = await this.service.save(file);
    return { name };
  }

  @Get('files')
  list() {
    return this.service.list();
  }

  @Get('files/:name')
  async download(@Param('name') name: string, @Res() res: Response) {
    const file = await this.service.get(name);
    res.setHeader('Content-Type', 'application/json');
    return res.send(file);
  }

  @Delete('files/:name')
  async delete(@Param('name') name: string) {
    await this.service.delete(name);
    return { success: true };
  }
}
