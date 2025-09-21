export interface ExchangeRetryParams{
  exchangeName: string;
  connectionChannel: Channel
}

export interface AssertQueueRetryParams{
  queueName: string,
  exchangeName: string,
  retryQueueName: string,
  connectionChannel: Channel,
}