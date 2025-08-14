import fastify from "fastify";
import {BrokerClient} from "./broker/BrokerClient.ts";


const app = fastify();
const broker = BrokerClient.getInstance();

broker.comsumerProcessImage("processImageQueue");

app.listen({port: Number(process.env.PORT)}).then(() => {
  console.log("Server is running on port 3305");
});