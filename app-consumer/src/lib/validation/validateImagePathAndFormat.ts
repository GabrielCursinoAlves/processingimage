import { fileURLToPath } from 'url';
import path from 'path';

export class ValidateImagePathAndFormat{
  constructor(private __dirname = path.dirname(fileURLToPath(import.meta.url))) {}
  Handle(filePath: string){
    const fileName = path.join(filePath);
    console.log(fileName);
  }
}