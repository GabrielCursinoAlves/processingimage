import {SharpService} from "./services/SharpService.ts";
import {BrokerClient} from "./broker/BrokerClient.ts";
import fastify from "fastify";

const app = fastify({logger: true});

async function bootstrap(){
  const broker = BrokerClient.getInstance();
  const result = await broker.comsumerProcessImage("processImageQueue");
  
  if(result){ 
  
    const sharpService = new SharpService();
    const subFile = sharpService.handle(result); 
  }
}

bootstrap();

app.listen({port: Number(process.env.PORT)}).then(() => {
  console.log("Server is running on port 3305");
});