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

  private async exchange(exchangeName: string, channel: Channel):Promise<AssertExchangeReplies> {
   
    const retryexchange = await channel.assertExchange(exchangeName, 'direct', {
      durable: true,
      arguments:{
        'x-dead-letter-exchange': exchangeName,
      }
    });
    
    return retryexchange;
  };

  private async assertQuue(retryQueueName: string, exchangeName: string, channel: Channel):Promise<AssertQueueReplies> {
   
    const assertquue = await channel.assertQueue(retryQueueName,{
      durable: true,
      messageTtl: 5000,
      deadLetterExchange: exchangeName,
    });
    
    return assertquue;
  } 

  public async comsumerProcessImage(queueName:string):Promise<void>{ 
    if(!queueName){
      throw new Error("Queue name must be defined");
    }

    try {
      const channel = await this.channels();
      this.exchange('retry_exchange', channel);
      this.assertQuue('retry_queue', 'retry_exchange', channel);
      
      await channel.assertQueue(queueName, 
        { 
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
          return null;
        }

        try {
          const content = message.content.toString();
          await this.processImage(content);

          channel.ack(message);
        } catch (error) {
          console.error(`Error processing message: ${error}`);
          channel.nack(message, false, false); 
        }
        
      },{ noAck: false });
      
    } catch (error) {
       throw new Error(`Failed to send message to queue: ${error}`);
    }
  }

  private async processImage(data: string) {
    console.log(JSON.stringify(data));
  }
  
}