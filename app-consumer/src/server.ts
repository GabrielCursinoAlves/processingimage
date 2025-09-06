import {SharpService} from "./services/SharpService.ts";
import {BrokerClient} from "./broker/BrokerClient.ts";
import fastify from "fastify";

const app = fastify({logger: true});

async function bootstrap(){
  const broker = BrokerClient.getInstance();
  await broker.comsumerProcessImage("processImageQueue");
}

bootstrap();

app.listen({port: Number(process.env.PORT)}).then(() => {
  console.log("Server is running on port 3305");
});