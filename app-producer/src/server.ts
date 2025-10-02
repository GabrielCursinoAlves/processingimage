import { CreateProcessingImageRouter } from './routers/CreateProcessingImageRouter.ts';
import {ErrorHandler} from "./ErrorHandler.ts";
import {fastify} from "fastify";

const app = fastify();

app.register(CreateProcessingImageRouter);

app.setErrorHandler(ErrorHandler);

app.listen({port: Number(process.env.PORT)}).then(() => {
  console.log("Server is running on port 3304");
});

