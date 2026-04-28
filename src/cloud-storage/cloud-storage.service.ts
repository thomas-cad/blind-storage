import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CloudStorageProvider,
  FileMetadata,
} from './providers/cloud-storage-provider.interface';
import { GoogleDriveService } from './providers/google-drive.service';
import { DropboxService } from './providers/dropbox.service';

export type CloudProvider = 'google-drive' | 'dropbox';

@Injectable()
export class CloudStorageService {
  constructor(
    private googleDriveService: GoogleDriveService,
    private dropboxService: DropboxService,
  ) {}

  private getProvider(provider: CloudProvider): CloudStorageProvider {
    switch (provider) {
      case 'google-drive':
        return this.googleDriveService;
      case 'dropbox':
        return this.dropboxService;
      default:
        throw new BadRequestException(`Provider inconnu : ${provider}`);
    }
  }

  uploadFile(
    provider: CloudProvider,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    userId: string,
  ): Promise<string> {
    return this.getProvider(provider).uploadFile(fileName, fileBuffer, mimeType, userId);
  }

  downloadFile(provider: CloudProvider, fileId: string, userId: string): Promise<Buffer> {
    return this.getProvider(provider).downloadFile(fileId, userId);
  }

  deleteFile(provider: CloudProvider, fileId: string, userId: string): Promise<void> {
    return this.getProvider(provider).deleteFile(fileId, userId);
  }

  listFiles(provider: CloudProvider, userId: string): Promise<FileMetadata[]> {
    return this.getProvider(provider).listFiles(userId);
  }
}
