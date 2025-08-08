import {AllTypesMultipart} from "../../config/fastify/Multipart.config.ts";
import type {FastifyRequest, FastifyReply } from 'fastify';

export const UploadMiddleware = async (req:FastifyRequest, reply:FastifyReply) => {
  const data = await req.file();
 
  if(!data?.filename) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "No file uploaded"
    });
  }
 
  if(data?.file.truncated) {
    return reply.status(413).send({
      statusCode: 413,
      error: "Payload Too Large",
      message: "File size exceeds the limit"
    });
  }

  if(!AllTypesMultipart.includes(data?.mimetype)) {
    return reply.status(415).send(
      {
        statusCode: 415,
        error: "Unsupported Media Type",
        message: "Unsupported file type"
      });
  }

  req.uploadFile = data;

}