export interface ExchangeRetryParams{
  exchangeName: string;
  connectionChannel: Channel
}

export interface AssertQueueRetryParams{
  retryQueueName: string,
  exchangeName: string,
  queueName: string,
  connectionChannel: Channel,
}