import {FastifyRequest, FastifyReply} from "fastify";
import {AppError} from "./lib/middlewares/AppErrorMiddleware.ts";

export const ErrorHandler =(
  error: Error, 
  request: FastifyRequest, 
  reply: FastifyReply) => {

  if(error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: error.name,
      statusCode: error.statusCode,
      message: error.message
    });
  }else{
     reply.status(500).send({
      error: "Internal Server Error",
      statusCode: 500,
      message: "An unexpected error has occurred."
    });
  }
}