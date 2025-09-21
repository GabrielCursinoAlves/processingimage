import { PrismaUniqueViolationError, PrismaRecordNotFoundError} from "../../lib/middlewares/PrismaErrorMiddleware.ts";
import { ProcessedImageParams, ProcessedReceiveParams } from "../../interface/UploadParams.ts";
import { prisma } from "../../config/prisma/connection.ts";

export default class ProcessedImage {
  async save(data:ProcessedImageParams[],tsxprisma:PrismaClientTransaction): Promise<void> {
   
    for(const files of data){
      const { id, image_id, file_path, mime_type } = files;
     
      try {
        await tsxprisma.processedImage.create({
          data: {
            id,
            image_id,
            file_path,
            mime_type,
          }
        });

      } catch (error) {
        if(error instanceof PrismaUniqueViolationError && error.code == "P2002"){
          throw new PrismaUniqueViolationError(`record does not exist in the database: ${error.message}`);
        }
      }
    }
   
  }

  async update(data: ProcessedReceiveParams[]):Promise<void>{
    const dataFormat = Array.isArray(data) ? data : [data];

    for(const files of dataFormat){
      const {id, status, error_reason} = files; 

      try{
        await prisma.processedImage.update({ where:{ id },
          data:{ status, error_reason }
        });
      
      }catch(error){
        if(error instanceof PrismaRecordNotFoundError && error.code == "P2025"){
          throw new PrismaUniqueViolationError(`record does not exist in the database: ${error.message}`);
        }
      }

    }

  }
    
}