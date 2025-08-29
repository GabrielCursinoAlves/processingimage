import { 
  BadRequestError,
  NotFoundError,
  PayloadToolLargeError,
  UnsupportedMediaTypeError
} from "./AppErrorMiddleware.ts";

import {AllTypesMultipart} from "../../config/fastify/Multipart.config.ts";
import type {FastifyRequest, FastifyReply } from 'fastify';

export const UploadMiddleware = async (req:FastifyRequest, reply:FastifyReply) => {
  const data = await req.file();

  if(!data?.fieldname) {
    throw new BadRequestError("No fieldname not exists");
  }
  
  if(!data.filename){
    throw new NotFoundError("No file uploaded");
  }

  if(data?.file.truncated) {
    throw new PayloadToolLargeError("File size exceeds the limit");
  }

  if(!AllTypesMultipart.includes(data?.mimetype)) {
    throw new UnsupportedMediaTypeError("Unsupported file type");
  }

  req.uploadFile = data;

}