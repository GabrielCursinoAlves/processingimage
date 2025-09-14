import {Multipart,MultipartFile} from "@fastify/multipart";

declare module 'fastify' {
  interface FastifyRequest {
    uploadFile: MultipartFile[];
  }
}

declare module '@fastify/multipart'{
  interface MultipartFile{
    filepath: string;
  }
}