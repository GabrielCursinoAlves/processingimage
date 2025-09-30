import { AppError } from "../lib/middlewares/AppErrorMiddleware.ts";
import {ProcessedImages} from "../db/schema/ProcessedImages.ts";
import { UploadParams } from "../interface/UploadParams.ts";
import { SharpService } from "./SharpService.ts";

export class ImageProcessingService{
  constructor(private sharpService: SharpService = new SharpService()){}
  async handle(data:UploadParams):Promise<void>{
    const result = await this.sharpService.handle(data);
  
    const {id, processing_id, processed_file_path} = result;

    try {
      const processedImages = new ProcessedImages();
      await processedImages.save({
        id,
        processing_id, 
        processed_file_path
      });

    } catch (error) {
      if(error instanceof AppError && error.statusCode == 500){
        throw new AppError(`Database query failed: ${error.message}`, 500);
      }
    }
  }
}