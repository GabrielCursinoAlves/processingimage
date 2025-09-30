import {BrokerClient} from "../broker/BrokerClient.ts";

async function ConsumerQueueListener(){
  const broker = BrokerClient.getInstance();
  await broker.comsumerProcessImage("processImageQueue");
}

async function RunConsumerQueue() {
  
  while (true) {
    try {
      await ConsumerQueueListener();
    } catch (error) {
      console.error("Erreur dans ConsumerQueueListener: ", error);
    }
    await new Promise(res => setTimeout(res, 5000));
  }
  
}

RunConsumerQueue();