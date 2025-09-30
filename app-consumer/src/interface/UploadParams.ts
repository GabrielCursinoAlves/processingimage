interface BaseParams{
  id: string,
  image_id: string,
}

interface Validate{
  file_path: string,
  mime_type: string,
}

export interface UploadValidate extends Validate{}

export interface UploadParams extends BaseParams{
  file_path: string,
  mime_type: string,
}
 
export interface ProcessedPublishParams extends BaseParams{
  error_reason?: string
  status: 'completed' | 'failed',
}

export interface ProcessedsImages{
  id: string,
  processing_id: string,
  processed_file_path: string
}