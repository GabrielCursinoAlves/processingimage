import {AppError, BadRequestError, NotFoundError} from "../lib/middlewares/AppErrorMiddleware.ts";
import { ProcessedsImages, UploadParams } from '../interface/UploadParams.ts';
import {FileHandler} from "../lib/filesystem/FileHandler.ts";
import crypto from 'crypto';
import sharp from 'sharp';
import path from 'path';

export class SharpService {
  constructor(private fileHandler = new FileHandler()) {}
  async handle(data: UploadParams):Promise<ProcessedsImages> {
    const {id, image_id, file_path, mime_type} = data;
    if(!image_id){
      throw new NotFoundError("processed image id not defined");
    }

    if(!this.fileHandler.validateFile({file_path,mime_type})){
      throw new BadRequestError("Invalid file format");
    }

    const pathFile = file_path.split('\\');
    const subDirectory = this.fileHandler.createDirExists(id);
  
    try {

      const fileId = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileId}.${pathFile[pathFile.length -1].split('.').pop()}`;

      const processed_file_path = `${subDirectory}${path.sep}resized_${fileName}`;
      
      await sharp(file_path)
      .resize(200, 200)
      .composite([{
        input: path.join(process.cwd(), '..', 'assets', 'logo', 'watermark.png'),
        gravity: 'southeast',
      }])
      .toFile(processed_file_path);
      
      return {
        image_processing_id: image_id,
        processed_file_path
      }

    } catch (error) {
      throw new AppError('Error processing image', 500);
    }
     
  }
}