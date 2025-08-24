export interface BrokerParams{
  queueId:string,
  queueName:string,
  message: {
    image_id: string,
    file_path: string,
    mimetype: string,
    original_filename: string
  },
}