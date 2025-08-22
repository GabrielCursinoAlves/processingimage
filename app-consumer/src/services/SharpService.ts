import { UploadParams } from '../interface/UploadParams';
import sharp from 'sharp';

export class SharpService {
  async Handle(data: UploadParams):Promise<void> {
    const {image_id, file_path, original_filename} = data;
    console.log(image_id);
  }
}