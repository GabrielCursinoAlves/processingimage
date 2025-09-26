import { JsonValue } from "@prisma/client/runtime/library";
import { UploadParams } from "../../interface/UploadParams";

export function Convert(data: JsonValue):UploadParams | null{
  if(typeof data === 'object' && data !== null && !Array.isArray(data)){
    
     const obj = data as Record<string, string>;
     const {id, image_id, file_path, mime_type, original_filename} = obj;
     
      return {
        id,
        image_id,
        file_path,
        mime_type,
        original_filename
      } as UploadParams;
  }

  return null;
}