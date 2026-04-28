export interface FileMetadata {
  id: string;
  name: string;
  size?: number;
  createdAt?: Date;
  mimeType?: string;
}

// Contrat commun à tous les providers de stockage.
// Chaque méthode reçoit userId car les opérations sont toujours liées à un utilisateur
// (authentification OAuth2 par utilisateur pour Google Drive, organisation par dossier pour Dropbox).
export interface CloudStorageProvider {
  uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    userId: string,
  ): Promise<string>; // retourne l'ID du fichier chez le provider

  downloadFile(fileId: string, userId: string): Promise<Buffer>;

  deleteFile(fileId: string, userId: string): Promise<void>;

  listFiles(userId: string): Promise<FileMetadata[]>;
}
