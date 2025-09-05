import {prisma} from "../../config/prisma/connection.ts";
import { NotFoundError } from "../../lib/middlewares/AppErrorMiddleware.ts";

class ProcessedImages{
  async update(image_processing_id:string):Promise<void>{
  
    const processedsExist = await prisma.processed_images.findUnique({
      where: {image_processing_id}
    });

    if(!processedsExist){
      throw new NotFoundError("The processed image does not exist");
    };

  }
}