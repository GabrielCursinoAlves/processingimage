import {UploadPublishAndSave} from "../services/UploadPublishAndSave.ts";
//
import { StorageService } from '../services/StorageService.ts';
import type { FastifyRequest, FastifyReply } from 'fastify';
import {BrokerClient} from "../broker/BrokerClient.ts";  

export default class CreateProcessingImage{
 constructor(private storageServices: StorageService = new StorageService(), private uploadPublishAndSave: UploadPublishAndSave = new UploadPublishAndSave()) {}
 handle = async (req:FastifyRequest, reply:FastifyReply): Promise<void> => {
    const data = await req.uploadFile;
    
    const result = await this.storageServices?.saveUploadedFile(data);

    await this.uploadPublishAndSave.processedTransitions(result);

    /*const broker = await BrokerClient.getInstance();
    const resultbroker = await broker.sendProcessImageRequest('processImageQueue', result);
    
    if(result.length > 0){
      this.processedImage.save(result);
    }

    return reply.send(resultbroker);*/
 }
}