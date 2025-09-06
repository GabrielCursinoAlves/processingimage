import {fastify} from "fastify";
import { 
  serializerCompiler, 
  validatorCompiler,
  type ZodTypeProvider
}
from 'fastify-type-provider-zod';  
import {ErrorHandler} from "./ErrorHandler.ts";

import { CreateProcessingImageRouter } from './routers/CreateProcessingImageRouter.ts';
import { BrokerClient } from "./broker/BrokerClient.ts";

const app = fastify({logger: true}).withTypeProvider<ZodTypeProvider>();

async function bootstrap(){
  const broker = BrokerClient.getInstance();
  const result = await broker.processedReceiveQueue("producer_callback_queue");
}

bootstrap();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(CreateProcessingImageRouter);

app.setErrorHandler(ErrorHandler);

app.listen({port: Number(process.env.PORT)}).then(() => {
  console.log("Server is running on port 3304");
});

