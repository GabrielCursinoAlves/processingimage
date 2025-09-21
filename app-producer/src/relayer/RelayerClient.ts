import { UploadParams } from "../interface/UploadParams.ts";
import { JsonValue } from "@prisma/client/runtime/library";
import { BrokerClient } from "../broker/BrokerClient.ts";
import { prisma } from "../config/prisma/connection.ts";

function Convert(data: JsonValue){
  if(typeof data === 'object' && data !== null && !Array.isArray(data)){
     const obj = data as Record<string, string>;
     const {id, image_id, file_path, mime_type, original_filename} = obj;
     
      return {
        id,
        image_id,
        file_path,
        mime_type,
        original_filename
      };
  }
}

async function RelayerClient(){
  try {
    
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
        const {id, image_id, file_path, mime_type, original_filename} = result;
        
        data.push({
          id, 
          image_id, 
          file_path,
          mime_type, 
          original_filename
        });

        await brokerClient.sendProcessImageRequest('processImageQueue', data);
        await prisma.outbox.update({
          where:{ id: message.id }, data:{ sent: true }
        });

      };

    }
   
  } catch (error) {
    console.log("Database query failed");
  }

}

setInterval(RelayerClient, 5000);
console.log('Service Relayer init');