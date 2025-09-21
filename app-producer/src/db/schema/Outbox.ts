import { UploadParams } from "../../interface/UploadParams";
import { PrismaUniqueViolationError } from "../../lib/middlewares/PrismaErrorMiddleware";

export default class Outbox {
  async save(data:UploadParams[],tsxprisma:PrismaClientTransaction): Promise<void> {
    
    for(const files of data){
      const { id, image_id, file_path, mime_type, original_filename } = files;

      const payload ={
         id,
          image_id,
          file_path,
          mime_type,
          original_filename
      };

      try {
        await tsxprisma.outbox.create({
          data: {
           payload
          }
        });

      } catch (error) {
        if(error instanceof PrismaUniqueViolationError && error.code == "P2002"){
          throw new PrismaUniqueViolationError(`record does not exist in the database: ${error.message}`);
        }
      }

    }
  }
}