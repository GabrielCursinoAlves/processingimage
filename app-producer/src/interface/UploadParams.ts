export interface UploadParams{
  id: string,
  image_id: string,
  file_path: string,
  mime_type: string,
  original_filename: string
}

export interface ReturnProducer{
  message: string,
  image_id: string,
  count: number
}

export interface ProcessedImageParams{
  id: string
  image_id: string,
  file_path: string,
  mime_type: string
}

export interface ProcessedReceiveParams{
  id: string,
  image_id: string,
  status: string,
  error_reason: string;
}