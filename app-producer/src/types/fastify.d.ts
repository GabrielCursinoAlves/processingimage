import Multipart from "@fastify/multipart";

declare module 'fastify' {
  interface FastifyRequest {
    uploadFile: Multipart;
  }
}