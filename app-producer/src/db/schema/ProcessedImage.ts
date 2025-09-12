import { ProcessedImageParams, ProcessedReceiveParams } from "../../interface/UploadParams.ts";
import {AppError} from "../../lib/middlewares/AppErrorMiddleware.ts";
import { prisma } from "../../config/prisma/connection.ts";

export class ProcessedImage {
  async save(data:ProcessedImageParams[]): Promise<void> {
   
    for(const files of data){
      const { id, image_id, file_path, mime_type } = files;
     
      try {
        await prisma.processedImage.create({
          data: {
            id,
            image_id,
            file_path,
            mime_type,
          }
        });

      } catch (error) {
        throw new AppError(`Failed to send data to database: ${error}`, 500);
      }
    }
   
  }

  async update(data: ProcessedReceiveParams[]):Promise<void>{
    
    const dataFormat = Array.isArray(data) ? data : [data];

    for(const files of dataFormat){
      const {id, status, error_reason} = files; 
     
      try{

        if(await prisma.processedImage.findFirst({where:{ id }})){
          await prisma.processedImage.update({ where:{ id },
          data:{ status, error_reason}
          });
        }

      }catch(error){
        throw new AppError(`Failed to send data to database: ${error}`, 500);
      }

    }

  }
    
}