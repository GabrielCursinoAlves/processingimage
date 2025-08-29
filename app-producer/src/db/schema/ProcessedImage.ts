import {NotFoundError} from "../../lib/middlewares/AppErrorMiddleware.ts";
import { ProcessedParams } from "../../interface/UploadParams.ts";
import { prisma } from "../../config/prisma/connection.ts";

export class ProcessedImage {
  async save(data:ProcessedParams): Promise<void> {
    const { image_id:id, file_path, mime_type } = data;
    console.log(id, file_path, mime_type);
    const processedExist = await prisma.processedImage.findUnique({
      where: { id }
    })

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
}