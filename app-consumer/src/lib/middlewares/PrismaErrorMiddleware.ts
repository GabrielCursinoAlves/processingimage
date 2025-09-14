import { Prisma } from "@prisma/client"

export class PrismaUniqueViolationError extends Prisma.PrismaClientKnownRequestError{
  constructor(message: string) {

    const code = "P2002";
    const clientVersion = Prisma.prismaVersion.client;
    super(message,{code, clientVersion});

    this.name = 'NotFoundError';
  }
}