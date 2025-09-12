import { ProcessedImage } from '../db/schema/ProcessedImage.ts';
import { StorageService } from '../services/StorageService.ts';
import type { FastifyRequest, FastifyReply } from 'fastify';
import {BrokerClient} from "../broker/BrokerClient.ts";  

export default class CreateProcessingImage{
 constructor(private storageServices: StorageService = new StorageService(), private processedImage: ProcessedImage = new ProcessedImage()) {}
 handle = async (req:FastifyRequest, reply:FastifyReply): Promise<void> => {
    const data = await req.uploadFile;
    
    const result = await this.storageServices?.saveUploadedFile(data);

    const broker = await BrokerClient.getInstance();
    const resultbroker = await broker.sendProcessImageRequest('processImageQueue', result);
    
    if(result.length > 0){
      this.processedImage.save(result);
    }

    return reply.send(resultbroker);
 }
}