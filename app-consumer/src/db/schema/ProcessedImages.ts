import { AppError, NotFoundError } from "../../lib/middlewares/AppErrorMiddleware.ts";
import {ProcessedsImages} from "../../interface/UploadParams.ts";
import {prisma} from "../../config/prisma/connection.ts";

export class ProcessedImages{
  async save(data:ProcessedsImages):Promise<void>{
    const { image_processing_id, processed_file_path } = data;
   
    try {
      if(await prisma.processed_images.findUnique({where: { image_processing_id }})){
        throw new NotFoundError('The resized image already exists');
      }

      await prisma.processed_images.create({
        data: {
          image_processing_id,
          processed_file_path,
        }
      });

    } catch (error) {
       throw new AppError(`Failed to send data to database: ${error}`, 500);
    }

  }
}