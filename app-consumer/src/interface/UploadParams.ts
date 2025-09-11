export interface UploadParams{
  image_id?: string,
  file_path: string,
  mime_type: string,
  original_filename?: string
}

export interface ProcessedsImages{
  image_processing_id: string,
  processed_file_path: string
}

export interface ProcessedPublishParams{
  id: string,
  image_id: string
}

export interface ProcessedConfirmParams{
  status: 'completed' | 'failed',
  error_reason?: string
}