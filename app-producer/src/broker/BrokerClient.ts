import {AppError, NotFoundError} from "../lib/middlewares/AppErrorMiddleware.ts";
import type { BrokerParams } from '../interface/BrokerParams.ts';
import { ProcessedImage } from '../db/schema/ProcessedImage.ts';
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

  private async connect():Promise<Connection>{ 
    if(!this.connection) {
      if(!process.env.BROKER_URL) {
        throw new NotFoundError('BROKER_URL must be defined');
      }
      this.connection = await amqp.connect(process.env.BROKER_URL);
    }
    return this.connection;
  }

  private async channels():Promise<Channel> {
    if(!this.channel) {
      const connection = await this.connect();
      this.channel = await connection.createConfirmChannel()
    }
    return this.channel;
  };

  public async processedReceiveQueue(queueName:string):Promise<void>{
    if(!queueName){
      throw new NotFoundError('Queue name must be defined');
    }

    try {
      const channel = await this.channels();
      await channel.assertQueue(queueName, {durable: true});

      await channel.consume(queueName, async message => {
        if(!message){
          throw new NotFoundError("Message is null");
        }

        try {    
          const content = JSON.parse(message.content.toString());
          const processedImage = new ProcessedImage();
          await processedImage.update(content);

          channel.ack(message);
              
        } catch (error) {
          throw new AppError(`Error processing message: ${error}`,500);
        }

      },{ noAck: false });

    } catch (error) {
       throw new AppError(`Failed to send message to queue: ${error}`, 500);
    }
    
  } 

  public async sendProcessImageRequest(data:BrokerParams):Promise<{image_id: string}>{
    const { queueId, queueName, message } = data;
  
    if(!queueName){
      throw new NotFoundError('Queue name must be defined');
    }
    
    try {
      const channel = await this.channels();
      await channel.assertQueue(queueName, 
        { 
          durable: true,
          arguments: {
            'x-dead-letter-exchange': 'retry_exchange',
            'x-dead-letter-routing-key': 'retry_queue'
          } 
        }
      );

      await channel.sendToQueue(
        queueName, 
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
      throw new AppError(`Failed to send message to queue: ${error}`, 500);
    }
  
  } 
}