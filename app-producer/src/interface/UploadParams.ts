interface BaseParams {
  id: string,
  image_id: string,
  file_path: string,
  mime_type: string,
};

export interface UploadParams extends BaseParams{
  original_filename: string
};

export interface ProcessedImageParams extends BaseParams{};

export interface ReturnProducer{
  image_id: string,
  message: string,
  count: number
}

export interface ProcessedReceiveParams{
  id: string,
  status: string,
  image_id: string,
  error_reason: string;
}