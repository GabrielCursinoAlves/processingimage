import {AppError} from "../lib/middlewares/AppErrorMiddleware.ts";
import {FileHandler} from "../lib/filesystem/FileHandler.ts";
import { UploadParams } from '../interface/UploadParams.ts';
import crpyto from 'crypto';
import sharp from 'sharp';
import path from 'path';

export class SharpService {
  constructor(private fileHandler = new FileHandler()) {}
  async handle(data: UploadParams):Promise<void> {
    const {file_path, mimetype} = data;
 
    if(this.fileHandler.validateFile({file_path,mimetype})){
      const pathFile = file_path.split('\\');

      const pathSubDirectory = pathFile[pathFile.length -1].replace(/\.[^/.]+$/, "");
      const subDirectory = this.fileHandler.createDirExists(pathSubDirectory);
    
      try {
        const fileId = crpyto.randomBytes(10).toString('hex');
        const fileName = `${fileId}.${pathFile[pathFile.length -1].split('.').pop()}`;
      
        await sharp(file_path)
        .resize(200, 200)
        .composite([{
          input: path.join(process.cwd(), '..', 'assets', 'logo', 'watermark.png'),
          gravity: 'southeast',
        }])
        .toFile(`${subDirectory}/resized_${fileName}`);

      } catch (error) {
        throw new AppError('Error processing image', 500);
      }
     
    }
    
  }
}