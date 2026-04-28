import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleAuthModule } from './auth/google/google-auth.module';
import { CloudStorageModule } from './cloud-storage/cloud-storage.module';

@Module({
  imports: [
    // isGlobal: true rend ConfigModule disponible partout sans avoir à le réimporter
    ConfigModule.forRoot({ isGlobal: true }),
    GoogleAuthModule,
    CloudStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
