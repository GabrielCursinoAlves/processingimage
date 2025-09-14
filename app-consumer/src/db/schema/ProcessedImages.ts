import {PrismaUniqueViolationError} from "../../lib/middlewares/PrismaErrorMiddleware.ts";
import {ProcessedsImages} from "../../interface/UploadParams.ts";
import {prisma} from "../../config/prisma/connection.ts";

export class ProcessedImages{
  async save(data:ProcessedsImages):Promise<void>{
    const { id, processing_id, processed_file_path } = data;
   
    try {
      
      await prisma.processed_images.create({
        data: {
          processing_id,
          image_id: id,
          processed_file_path,
        }
      });

    } catch (error) {
      if(error instanceof PrismaUniqueViolationError && error.code == "P2002"){
        throw new PrismaUniqueViolationError(`record does not exist in the database: ${error.message}`);
      }
    }

  }
}