import {
  NotFoundError, 
  UnsupportedMediaTypeError} 
from "../middlewares/AppErrorMiddleware.ts";
import {AllTypesMultipart} from "../../config/filesystem/FileSystem.config.ts";
import { UploadParams } from "../../interface/UploadParams.ts";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

export class FileHandler{
  constructor(private __dirname = path.dirname(fileURLToPath(import.meta.url))) {}
  validateFile(data:UploadParams):boolean {
    const {file_path, mime_type} = data;

    const fileName = path.join(file_path);
    
    if(!fs.existsSync(fileName)) {
      throw new NotFoundError("File not found");
    }

    if(!AllTypesMultipart.includes(mime_type)) {
      throw new UnsupportedMediaTypeError("Unsupported file type");
    }
    
    return true;
  }

  createDirExists(pathDir?:string):string {
    const dir = path.join(process.cwd(), "..", "uploads", pathDir || "");
    
    if(!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return dir;
  }
}