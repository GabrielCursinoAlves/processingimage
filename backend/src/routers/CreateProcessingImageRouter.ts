import {MultipartConfig} from "../config/fastify/Multipart.config.ts";
import {UploadMiddleware} from "../lib/middlewares/UploadMiddleware.ts";
import type {FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import {ControllerImage} from "../controller/index.ts";
import fastifyMultipart from '@fastify/multipart';

export const CreateProcessingImageRouter:FastifyPluginAsyncZod = async (app) => {
  await app.register(fastifyMultipart,{limits: MultipartConfig});
  app.post("/createProcessingImage",{preHandler: [UploadMiddleware]}, new ControllerImage.CreateProcessingImage().Handle);
};
  