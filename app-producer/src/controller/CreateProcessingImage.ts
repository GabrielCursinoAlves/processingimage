import {UploadPublishAndSave} from "../services/UploadPublishAndSave.ts";
import { StorageService } from '../services/StorageService.ts';
import type { FastifyRequest } from 'fastify';

export default class CreateProcessingImage{
 constructor(private storageServices: StorageService = new StorageService(), private uploadPublishAndSave: UploadPublishAndSave = new UploadPublishAndSave()) {}
 handle = async (req:FastifyRequest): Promise<void> => {
    const data = await req.uploadFile;
    
    const result = await this.storageServices?.saveUploadedFile(data);

    await this.uploadPublishAndSave.processedTransitions(result);

 }
}