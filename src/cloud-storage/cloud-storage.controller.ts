import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudStorageService } from './cloud-storage.service';
import type { CloudProvider } from './cloud-storage.service';

// Toutes les routes commencent par /cloud-storage/:provider
// Providers disponibles : google-drive | dropbox
@Controller('cloud-storage/:provider')
export class CloudStorageController {
  constructor(private readonly cloudStorageService: CloudStorageService) {}

  // GET /cloud-storage/:provider/files?userId=xxx
  @Get('files')
  async listFiles(
    @Param('provider') provider: string,
    @Query('userId') userId: string,
  ) {
    const files = await this.cloudStorageService.listFiles(
      provider as CloudProvider,
      userId,
    );
    return { files };
  }

  // POST /cloud-storage/:provider/upload?userId=xxx
  // Corps de la requête : multipart/form-data avec un champ "file"
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('provider') provider: string,
    @Query('userId') userId: string,
    @UploadedFile() file: { originalname: string; buffer: Buffer; mimetype: string },
  ) {
    const fileId = await this.cloudStorageService.uploadFile(
      provider as CloudProvider,
      file.originalname,
      file.buffer,
      file.mimetype,
      userId,
    );
    return { fileId, message: 'Fichier uploadé avec succès' };
  }

  // GET /cloud-storage/:provider/download/:fileId?userId=xxx
  // Renvoie le contenu brut du fichier (déjà chiffré côté client à l'origine)
  @Get('download/:fileId(*)')
  async downloadFile(
    @Param('provider') provider: string,
    @Param('fileId') fileId: string,
    @Query('userId') userId: string,
    @Res() res: any,
  ) {
    const buffer = await this.cloudStorageService.downloadFile(
      provider as CloudProvider,
      fileId.startsWith('/') ? fileId : `/${fileId}`,
      userId,
    );
    res.set({ 'Content-Type': 'application/octet-stream' });
    res.send(buffer);
  }

  // DELETE /cloud-storage/:provider/files/:fileId?userId=xxx
  @Delete('files/:fileId(*)')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(
    @Param('provider') provider: string,
    @Param('fileId') fileId: string,
    @Query('userId') userId: string,
  ) {
    await this.cloudStorageService.deleteFile(
      provider as CloudProvider,
      fileId.startsWith('/') ? fileId : `/${fileId}`,
      userId,
    );
  }
}
