import {UploadMiddleware} from "../lib/middlewares/UploadMiddleware.ts";
import {MultipartConfig} from "../config/fastify/Multipart.config.ts";
import {ControllerImage} from "../controller/index.ts";
import fastifyMultipart from '@fastify/multipart';
import { FastifyInstance } from "fastify";

export const CreateProcessingImageRouter = async (app:FastifyInstance) => {
  await app.register(fastifyMultipart,{limits: MultipartConfig});
  app.post("/createProcessingImage",{preHandler: [UploadMiddleware]}, new ControllerImage.CreateProcessingImage().handle);
};
  