import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private dir = join(process.cwd(), 'uploads');

  async save(file: Express.Multer.File) {
    await fs.mkdir(this.dir, { recursive: true });
    let name = randomUUID() + '-file.json'; // fallback name
    
    try {
      const encryptedData = JSON.parse(file.buffer.toString());
      if (encryptedData.originalName) {
        // Use the original filename with a short hash prefix to avoid collisions
        const hash = randomUUID().substring(0, 8);
        name = hash + '-' + encryptedData.originalName;
      }
    } catch (e) {
      // If parsing fails, use the fallback name
    }
    
    await fs.writeFile(join(this.dir, name), file.buffer);
    return name;
  }

  async list() {
    await fs.mkdir(this.dir, { recursive: true });
    return fs.readdir(this.dir);
  }

  async get(name: string) {
    return fs.readFile(join(this.dir, name));
  }

  async delete(name: string) {
    await fs.unlink(join(this.dir, name));
  }
}
