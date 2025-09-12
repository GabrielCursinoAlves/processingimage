import { NotFoundError } from "../lib/middlewares/AppErrorMiddleware";
import {ProcessedImages} from "../db/schema/ProcessedImages";
import { UploadParams } from "../interface/UploadParams";
import { SharpService } from "./SharpService";

export class ImageProcessingService{
  constructor(private sharpService: SharpService = new SharpService()){}
  async handle(data:UploadParams):Promise<void>{
   
    const result = await this.sharpService.handle(data);
   
    const {image_processing_id, processed_file_path} = result;

    /*if(!image_processing_id){
       throw new NotFoundError("processed image id not defined");
    }

    const processedImages = new ProcessedImages();
    await processedImages.save({
      image_processing_id, 
      processed_file_path
    });*/
  }
}