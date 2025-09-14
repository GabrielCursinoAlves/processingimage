import type {UploadParams} from "../interface/UploadParams.ts";
import type {MultipartFile} from '@fastify/multipart';
import { fileURLToPath } from 'url';
import path from 'node:path';
import crypto from 'crypto';
import fs from 'node:fs';

export class StorageService{
  constructor(private __dirname = path.dirname(fileURLToPath(import.meta.url))) {}
  async saveUploadedFile(file: MultipartFile[]): Promise<UploadParams[]> {
    
    let counter = 1;
    const data: UploadParams[] = [];

    const processedId = crypto.randomBytes(16).toString('hex'); 
    const fileDir = path.join(this.__dirname, '../../../uploads');

    for (const files of file){
      const Id = crypto.randomBytes(16).toString('hex');
      const fileName = `${processedId}_${counter}${path.extname(files.filename)}`;
      const fileUpload = path.join(this.__dirname, '../../../uploads', fileName);
     
      if(!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }
      
      await fs.promises.copyFile(files.filepath, fileUpload);

      data.push({
        id: Id,
        image_id: processedId, 
        file_path: fileUpload,
        mime_type: files.mimetype,
        original_filename: files.filename
      });
      counter++;
    }

    return data;
   
  }
}