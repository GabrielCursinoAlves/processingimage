import { prisma } from "../config/prisma/connection.ts";
import { Convert } from "../lib/json/normalize.json.ts";
import { BrokerClient } from "../broker/BrokerClient.ts";
import { UploadParams } from "../interface/UploadParams.ts";

async function RelayerClient(){
  try {
    console.log("Checking for unsent messages...");
    const messages = await prisma.outbox.findMany({
      where:{
        sent: false
      },
      take: 50
    });

    const data: UploadParams[] = [];
    const brokerClient = await BrokerClient.getInstance();

    for(const message of messages){

      const result =  Convert(message.payload);

      if(result){
        
        data.push(result);
      }

    }

    if(data.length > 0){

      await brokerClient.sendProcessImageRequest('processImageQueue', data);
      await prisma.outbox.updateMany({
        where: { sent: false }, data:{ sent: true }
      });
    
    }
   
  } catch (error) {
    console.log(`Database query failed: ${error}`);
  }

}

async function RunRelayer() {
  while (true) {
    
    try {
      await RelayerClient();
    } catch (error) {
      console.error("Erreur dans RelayerClient: ", error);
    }
   
    await new Promise(res => setTimeout(res, 5000));
  }
}

RunRelayer();