import {ExchangeRetryParams, AssertQueueRetryParams} from "../interface/BrokerParams.ts";
import {UploadParams} from "../interface/UploadParams.ts";
import * as amqp from 'amqplib';

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
        throw new Error('BROKER_URL must be defined');
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

  public async comsumerProcessImage(queueName:string):Promise<UploadParams>{ 
    if(!queueName){
      throw new Error("Queue name must be defined");
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
      
      return new Promise<UploadParams>((resolve, reject) => {
    
        channel.consume(queueName, async message => {
          if(!message){
            return reject(new Error("Message is null"));
          }
        
          const attemptsxDeath = message.properties?.headers?.["x-death"] || [];
          const attemptsMax = 3;

          try {
            
            const content = message.content.toString();
            channel.ack(message);
            
            resolve(JSON.parse(content));
            
          } catch (error) {

            if(attemptsxDeath.length < attemptsMax - 1){
              channel.nack(message, false, false);
            }else{
              channel.ack(message);
            }

            console.error(`Error processing message: ${error}`);
          }
          
        },{ noAck: false });
      });
      
    } catch (error) {
       throw new Error(`Failed to send message to queue: ${error}`);
    }
  }

  private processImage(data: string):UploadParams{
    const {image_id, file_path, original_filename} = JSON.parse(data);

    return {
      image_id,
      file_path,
      original_filename
    };
  }
  
}