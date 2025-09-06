export interface BrokerParams{
  queueId:string,
  queueName:string,
  message: {
    image_id: string,
    file_path: string,
    mime_type: string,
    original_filename: string
  }
}

export interface BrokerReceiveParams{
  id: string
  status: string
  error_reason: string
}