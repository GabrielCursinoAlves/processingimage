import {ExchangeRetryParams, AssertQueueRetryParams} from "../interface/BrokerParams.ts";
import {AppError,NotFoundError} from "../lib/middlewares/AppErrorMiddleware.ts";
import {UploadParams} from "../interface/UploadParams.ts";
import * as amqp from 'amqplib';
import { ImageProcessingService } from "../services/ImageProcessingService.ts";

export class BrokerClient {
  private static instance: BrokerClient;
  private connection?: Connection;
  private channel?: Channel;

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
      this.channel = await connection.createChannel();
    }
    return this.channel;
  };

  private async exchangeRetry(data: ExchangeRetryParams):Promise<AssertExchangeReplies> {
    const {exchangeName, connectionChannel} = data;
    
    const exchangeRetry = await connectionChannel.assertExchange(exchangeName, 'direct', {
      durable: true,
    });
    
    return exchangeRetry;
  };

  private async assertQuueRetry(data:AssertQueueRetryParams):Promise<AssertQueueReplies> {
    const {retryQueueName, exchangeName, queueName, connectionChannel} = data;

    const assertquueRetry = await connectionChannel.assertQueue(retryQueueName,{
      durable: true,
      messageTtl: 30000, 
      deadLetterExchange: exchangeName,
      deadLetterRoutingKey: queueName
    });
    
    return assertquueRetry;
  }
  
  private async setupRetry(queueName:string,channel:Channel):Promise<void>{
     const retryExhange = "retry_exchange"
     const retryQueue = "retry_queue";

     await this.exchangeRetry({
        exchangeName: retryExhange, 
        connectionChannel: channel
      });
      await this.assertQuueRetry({
        retryQueueName: retryQueue,
        exchangeName: retryExhange,
        queueName,
        connectionChannel: channel
      });
  }

  public async comsumerProcessImage(queueName:string):Promise<void>{ 
    if(!queueName){
      throw new NotFoundError("Queue name must be defined");
    }
    
    try {
      const channel = await this.channels();
      await this.setupRetry(queueName,channel);
      await channel.bindQueue('retry_queue', 'retry_exchange', 'retry_queue');
     
      await channel.assertQueue(queueName, { 
          durable: true,
          arguments: {
            'x-dead-letter-exchange': 'retry_exchange',
            'x-dead-letter-routing-key': 'retry_queue'
          }
        }
      );
      await channel.bindQueue(queueName, 'retry_exchange', queueName);
      
      await channel.consume(queueName, async message => {
        if(!message){
          throw new NotFoundError("Message is null");
        }
        
        const imageProcessingService = new ImageProcessingService();
        const attemptsxDeath = message.properties?.headers?.["x-death"] || [];
        const attemptsMax = 3;

        try {
          const content = JSON.parse(message.content.toString());
          await channel.publish('', 'producer_callback_queue', Buffer.from(JSON.stringify({
            id: content.image_id,
            status: 'completed'
          })));
          await imageProcessingService.handle({
            image_id: content.image_id,
            file_path: content.file_path,
            mime_type: content.mime_type
          });
          channel.ack(message);
            
        } catch (error) {

          if(attemptsxDeath.length < attemptsMax - 1){
            channel.nack(message, false, false);
            await channel.publish('', 'producer_callback_queue', Buffer.from(JSON.stringify({
              id: JSON.parse(message.content.toString()).image_id,
              status: 'failed',
              error_reason: error
            })));
          }else{
            channel.ack(message);
          }
            
          throw new AppError(`Error processing message: ${error}`, 500);
        }
          
      },{ noAck: false });
     
    } catch (error) {
       throw new AppError(`Failed to send message to queue: ${error}`, 500);
    }
  }
  
}