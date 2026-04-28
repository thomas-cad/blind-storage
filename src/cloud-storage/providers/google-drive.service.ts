import { Injectable, Logger } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import {
  CloudStorageProvider,
  FileMetadata,
} from './cloud-storage-provider.interface';
import { GoogleAuthService } from '../../auth/google/google-auth.service';

@Injectable()
export class GoogleDriveService implements CloudStorageProvider {
  private readonly logger = new Logger(GoogleDriveService.name);

  // GoogleAuthService gère les tokens OAuth2 par utilisateur.
  // On ne stocke plus de credentials globaux ici.
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  // Crée un client Google Drive authentifié avec le token de CET utilisateur.
  private async getDrive(userId: string): Promise<drive_v3.Drive> {
    const auth = await this.googleAuthService.getAuthenticatedClient(userId);
    return google.drive({ version: 'v3', auth });
  }

  // Retrouve (ou crée) le dossier "Blind Storage" dans le Drive de l'utilisateur.
  // Grâce au scope drive.file, l'app ne voit que ce dossier et son contenu.
  private async getOrCreateAppFolder(drive: drive_v3.Drive): Promise<string> {
    const response = await drive.files.list({
      q: `name='Blind Storage' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (response.data.files?.length) {
      return response.data.files[0].id!;
    }

    const folder = await drive.files.create({
      requestBody: {
        name: 'Blind Storage',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    this.logger.log('Dossier "Blind Storage" créé dans le Drive de l\'utilisateur');
    return folder.data.id!;
  }

  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    userId: string,
  ): Promise<string> {
    const drive = await this.getDrive(userId);
    const folderId = await this.getOrCreateAppFolder(drive);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: Readable.from(fileBuffer),
      },
      fields: 'id',
    });

    this.logger.log(`Fichier uploadé dans le Drive de "${userId}": ${response.data.id}`);
    return response.data.id!;
  }

  async downloadFile(fileId: string, userId: string): Promise<Buffer> {
    const drive = await this.getDrive(userId);
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' },
    );
    return Buffer.from(response.data as ArrayBuffer);
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const drive = await this.getDrive(userId);
    await drive.files.delete({ fileId });
    this.logger.log(`Fichier supprimé du Drive de "${userId}": ${fileId}`);
  }

  async listFiles(userId: string): Promise<FileMetadata[]> {
    const drive = await this.getDrive(userId);
    const folderId = await this.getOrCreateAppFolder(drive);

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, size, createdTime, mimeType)',
      spaces: 'drive',
    });

    return (response.data.files ?? []).map((file) => ({
      id: file.id!,
      name: file.name!,
      size: file.size ? parseInt(file.size) : undefined,
      createdAt: file.createdTime ? new Date(file.createdTime) : undefined,
      mimeType: file.mimeType ?? undefined,
    }));
  }
}
