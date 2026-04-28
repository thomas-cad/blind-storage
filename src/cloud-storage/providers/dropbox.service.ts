import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Dropbox } from 'dropbox';
import {
  CloudStorageProvider,
  FileMetadata,
} from './cloud-storage-provider.interface';

@Injectable()
export class DropboxService implements CloudStorageProvider {
  private readonly logger = new Logger(DropboxService.name);
  private dbx: Dropbox;

  constructor(private configService: ConfigService) {
    this.dbx = new Dropbox({
      accessToken: this.configService.get<string>('DROPBOX_ACCESS_TOKEN'),
    });
  }

  private buildPath(userId: string, fileName?: string): string {
    return fileName ? `/${userId}/${fileName}` : `/${userId}`;
  }

  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    _mimeType: string,
    userId: string,
  ): Promise<string> {
    const path = this.buildPath(userId, fileName);

    const response = await this.dbx.filesUpload({
      path,
      contents: fileBuffer,
      mode: { '.tag': 'overwrite' },
    });

    this.logger.log(`Fichier uploadé sur Dropbox: ${response.result.id}`);
    return response.result.path_display!;
  }

  // userId non utilisé ici — Dropbox utilise un token unique configuré dans .env.
  // Pour une gestion multi-utilisateurs Dropbox, il faudrait implémenter OAuth2 Dropbox.
  async downloadFile(fileId: string, _userId: string): Promise<Buffer> {
    const response = await this.dbx.filesDownload({ path: fileId });
    return (response.result as any).fileBinary as Buffer;
  }

  async deleteFile(fileId: string, _userId: string): Promise<void> {
    await this.dbx.filesDeleteV2({ path: fileId });
    this.logger.log(`Fichier supprimé de Dropbox: ${fileId}`);
  }

  async listFiles(userId: string): Promise<FileMetadata[]> {
    const path = this.buildPath(userId);

    try {
      const response = await this.dbx.filesListFolder({ path });

      return response.result.entries
        .filter((entry) => entry['.tag'] === 'file')
        .map((entry) => ({
          id: (entry as any).path_display as string,
          name: entry.name,
          size: (entry as any).size as number | undefined,
          mimeType: undefined,
        }));
    } catch {
      return [];
    }
  }
}
