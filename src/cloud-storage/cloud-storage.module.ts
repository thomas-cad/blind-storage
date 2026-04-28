import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudStorageController } from './cloud-storage.controller';
import { CloudStorageService } from './cloud-storage.service';
import { GoogleDriveService } from './providers/google-drive.service';
import { DropboxService } from './providers/dropbox.service';
import { GoogleAuthModule } from '../auth/google/google-auth.module';

@Module({
  // On importe GoogleAuthModule pour que GoogleDriveService puisse injecter GoogleAuthService
  imports: [ConfigModule, GoogleAuthModule],
  controllers: [CloudStorageController],
  providers: [CloudStorageService, GoogleDriveService, DropboxService],
  exports: [CloudStorageService],
})
export class CloudStorageModule {}
