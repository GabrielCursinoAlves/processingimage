import type { ProcessImageRequest } from '../app-producer/src/interface/ProcessImageRequest.ts';
import * as amqp from 'amqplib';

export class BrokerClient {
  private static instance: BrokerClient;
  private connection?: amqp.Connection;
  private channel?: amqp.Channel;

  static getInstance():BrokerClient{
    if(!BrokerClient.instance) {
      BrokerClient.instance = new BrokerClient();
    }
    return BrokerClient.instance;
  }

  private async connect():Promise<amqp.Connection>{ 
    if(!this.connection) {
      if(!process.env.BROKER_URL) {
        throw new Error('BROKER_URL must be defined');
      }
      this.connection = await amqp.connect(process.env.BROKER_URL);
    }
    return this.connection;
  }

  private async channels():Promise<amqp.Channel> {
    if(!this.channel) {
      const connection = await this.connect();
      this.channel = await connection.createConfirmChannel()
    }
    return this.channel;
  };

  public async sendProcessImageRequest(queueId:string,quuen:string,message:ProcessImageRequest):Promise<object>{
    if(!quuen){
      throw new Error('Queue name must be defined');
    }
    
    try {
      const channel = await this.channels();
      await channel.assertQueue(quuen, { durable: true });
      await channel.sendToQueue(
        quuen, 
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true, 
          correlationId: queueId
        }
      );

      return {
        image_id: queueId
      };

    } catch (error) {
      throw new Error(`Failed to send message to queue: ${error}`);
    }
  
  } 
}