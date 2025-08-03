import type { ProcessImageRequest } from '../interface/ProcessImageRequest.ts';
import * as amqp from 'amqplib';

let connection: amqp.Connection;
let channel: amqp.Channel;

export class BrokerClient {
  private connection?: amqp.Connection;

  async connect():Promise<amqp.Connection>{ 
    if(!process.env.BROKER_URL) {
      throw new Error('BROKER_URL must be defined');
    }
    this.connection = await amqp.connect(process.env.BROKER_URL);
    return this.connection;
  }

  async channel():Promise<amqp.Channel>{
    if(!this.connect()) {
      throw new Error('Connection must be defined');
    }
    const channel = (await this.connect()).createChannel();
    return channel;
  };

  async sendProcessImageRequest(quuen:string,message:ProcessImageRequest):Promise<void>{
    if(!quuen){
      throw new Error('Queue name must be defined');
    }

    const channel = await this.channel();
    await channel.assertQueue(quuen, { durable: true });
    const sendMessage = await channel.sendToQueue(quuen, Buffer.from(JSON.stringify(message)));

    if(!sendMessage) {
      throw new Error('Message could not be sent to the queue');
    }
  }
}