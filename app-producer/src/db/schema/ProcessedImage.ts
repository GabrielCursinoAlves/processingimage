import {NotFoundError} from "../../lib/middlewares/AppErrorMiddleware.ts";
import { ProcessedImageParams, ProcessedReceiveParams } from "../../interface/UploadParams.ts";
import { prisma } from "../../config/prisma/connection.ts";

export class ProcessedImage {
  async save(data:ProcessedImageParams): Promise<void> {
    const { image_id: id, file_path, mime_type } = data;
    
    const processedExist = await prisma.processedImage.findUnique({
      where: { id }
    });

    if(processedExist){
      throw new NotFoundError('Processed image already exists');
    }
   
    await prisma.processedImage.create({
      data: {
        id,
        file_path,
        mime_type,
      }
    });
  }

  async update(data:ProcessedReceiveParams):Promise<void>{
    const {id, status, error_reason} = data; 
   
    const processedExist = await prisma.processedImage.findUnique({
      where: { id }
    });
    
    console.log(id);
    if(processedExist){
      await prisma.processedImage.update({
        where:{ id },
        data:{
          status,
          error_reason
        }
      });
    }

  }
}