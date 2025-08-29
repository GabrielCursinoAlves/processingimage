import type {UploadParams} from "../interface/UploadParams.ts";
import type {MultipartFile} from '@fastify/multipart';
import { fileURLToPath } from 'url';
import path from 'node:path';
import crypto from 'crypto';
import fs from 'node:fs';

export class StorageService{
  constructor(private __dirname = path.dirname(fileURLToPath(import.meta.url))) {}
  async saveUploadedFile(file: MultipartFile): Promise<UploadParams> {
    
    const fileId = crypto.randomBytes(16).toString('hex'); 
    const fileName = `${fileId}${path.extname(file.filename)}`;

    const fileDir = path.join(this.__dirname, '../../../uploads');
    const fileUpload = path.join(this.__dirname, '../../../uploads', fileName);

    if(!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
   const buffer = await file.toBuffer();
   await fs.writeFileSync(fileUpload, buffer);

   return {
      image_id: fileId, 
      file_path: fileUpload,
      mime_type: file.mimetype,
      original_filename: file.filename,
    };

  }
}