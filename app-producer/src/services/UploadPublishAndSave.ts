import { AppError } from "../lib/middlewares/AppErrorMiddleware.ts";
import { UploadParams } from "../interface/UploadParams.ts";
import {prisma} from "../config/prisma/connection.ts";
import {Schemas} from "../db/schema/index.ts";

export class UploadPublishAndSave{
  async processedTransitions(data: UploadParams[]):Promise<void>{
    try {
     
      await prisma.$transaction(async (tx) => {
         await new Schemas.ProcessedImage().save(data,tx)
         await new Schemas.Outbox().save(data,tx)
      });
      
    } catch (error) {
      if(error instanceof AppError){
        throw new AppError(`Transaction process failure: ${error.message}`, 500);
      }
    }
  }
}