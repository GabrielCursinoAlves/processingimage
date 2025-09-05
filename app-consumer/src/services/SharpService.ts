import { UploadParams } from '../interface/UploadParams.ts';
import {AppError,BadRequestError} from "../lib/middlewares/AppErrorMiddleware.ts";
import {FileHandler} from "../lib/filesystem/FileHandler.ts";
import crpyto from 'crypto';
import sharp from 'sharp';
import path from 'path';

export class SharpService {
  constructor(private fileHandler = new FileHandler()) {}
  async handle(data: UploadParams):Promise<{processed_file_path:string}> {
    const {file_path, mime_type} = data;

    if(!this.fileHandler.validateFile({file_path,mime_type})){
      throw new BadRequestError("Invalid file format");
    }

    const pathFile = file_path.split('\\');

    const pathSubDirectory = pathFile[pathFile.length -1].replace(/\.[^/.]+$/, "");
    const subDirectory = this.fileHandler.createDirExists(pathSubDirectory);
      
    try {
      const fileId = crpyto.randomBytes(10).toString('hex');
      const fileName = `${fileId}.${pathFile[pathFile.length -1].split('.').pop()}`;
      
      const sub_file_path = `${subDirectory}/resized_${fileName}`;
      
      await sharp(file_path)
      .resize(200, 200)
      .composite([{
        input: path.join(process.cwd(), '..', 'assets', 'logo', 'watermark.png'),
        gravity: 'southeast',
      }])
      .toFile(sub_file_path);

      return {
        processed_file_path: sub_file_path
      }

    } catch (error) {
      throw new AppError('Error processing image', 500);
    }
     
  }
}