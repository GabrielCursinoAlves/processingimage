export interface UploadParams{
  image_id: string,
  file_path: string,
  mime_type: string,
  original_filename: string
}

export interface ProcessedImageParams{
  image_id: string,
  file_path: string,
  mime_type: string,
  status?: string
}