import {BrokerClient} from "../broker/BrokerClient.ts";

async function ProducerQueueListener(){
  const broker = BrokerClient.getInstance();
  await broker.processedReceiveQueue("producer_callback_queue");
}

async function RunProducerQueue() {
  
  while (true) {
    
    try {
      await ProducerQueueListener();
    } catch (error) {
      console.error("Erreur dans ProducerQueueListener: ", error);
    }
   
    await new Promise(res => setTimeout(res, 5100));
  }
  
}

RunProducerQueue();