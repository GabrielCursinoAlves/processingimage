import {fastify} from "fastify";
import { 
  serializerCompiler, 
  validatorCompiler,
  type ZodTypeProvider
}
from 'fastify-type-provider-zod';  
 
import { CreateProcessingImageRouter } from './routers/CreateProcessingImageRouter.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(CreateProcessingImageRouter);

app.listen({ port: Number(process.env.PORT) }).then(() => {
  console.log("Server is running on port 3304");
});

