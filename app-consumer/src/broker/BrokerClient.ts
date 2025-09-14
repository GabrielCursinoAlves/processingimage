import {ProcessedPublishParams, ProcessedConfirmParams, UploadParams} from "../interface/UploadParams.ts";
import {ExchangeRetryParams, AssertQueueRetryParams} from "../interface/BrokerParams.ts";
import {AppError,NotFoundError} from "../lib/middlewares/AppErrorMiddleware.ts";
import { ImageProcessingService } from "../services/ImageProcessingService.ts";
import * as amqp from 'amqplib';
import { error } from "console";
import { channel } from "diagnostics_channel";

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

  private processedPublish(data:ProcessedPublishParams, confirm: ProcessedConfirmParams, channel:Channel):void{
    const contentFormat = Array.isArray(data) ? data : [data];

    for(const file of contentFormat){
      channel.publish('', 'producer_callback_queue', Buffer.from(
      JSON.stringify({
        id: file.id, 
        image_id: file.image_id, 
        status: confirm.status, 
        error_reason: confirm.error_reason}
      )));
    }
  }

  private async processedImages(imageProcessingService:ImageProcessingService, data:UploadParams):Promise<void>{
    const contentFormat = Array.isArray(data) ? data : [data];

    for(const file of contentFormat){
      await imageProcessingService.handle({
        id: file.id,
        image_id: file.image_id,
        file_path: file.file_path,
        mime_type: file.mime_type
    });
    }
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

        const content = JSON.parse(message.content.toString());
        
        try {

          this.processedPublish(content, {status: 'completed'}, channel);
          await this.processedImages(imageProcessingService,content);

          channel.ack(message);
           
        } catch (error) {
         
          if(attemptsxDeath.length < attemptsMax - 1){
            
            if (error instanceof AppError) {
              this.processedPublish(content, {status: 'failed', error_reason: error.message}, channel);
            }
            channel.nack(message, false, false);

          }else{
            channel.ack(message);
          }
            
        }
          
      },{ noAck: false });
     
    } catch (error) {
       if(error instanceof AppError && error.statusCode == 500){
         throw new AppError(`Failed to send message to queue: ${error.message}`, 500);
       }
    }
  }
  
}