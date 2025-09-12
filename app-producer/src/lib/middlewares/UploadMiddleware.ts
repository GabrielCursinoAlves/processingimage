import { 
  BadRequestError,
  NotFoundError,
  PayloadToolLargeError,
  UnsupportedMediaTypeError
} from "./AppErrorMiddleware.ts";

import {AllTypesMultipart} from "../../config/fastify/Multipart.config.ts";
import type {FastifyRequest, FastifyReply } from 'fastify';

export const UploadMiddleware = async (req:FastifyRequest, reply:FastifyReply) => {
  const data = await req.saveRequestFiles();

  for (const dataUpload of data){
    
    if(!dataUpload?.fieldname) {
      throw new BadRequestError("No fieldname not exists");
    }

    if(!dataUpload.filename){
      throw new NotFoundError("No file uploaded");
    }

    if(dataUpload?.file.truncated) {
      throw new PayloadToolLargeError("File size exceeds the limit");
    }

    if(!AllTypesMultipart.includes(dataUpload?.mimetype)) {
      throw new UnsupportedMediaTypeError(`File type ${dataUpload.filename} is not supported`);
    }

  }

  req.uploadFile = data;

}