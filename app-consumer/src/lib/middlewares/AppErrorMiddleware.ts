export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'Error';
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string){
    super(message, 404);
    this.name = 'NotFoundError';
    this.message = message;
  }
}

export class BadRequestError extends AppError{
  constructor(message: string){
    super(message, 400);
    this.name = 'BadRequestError';
    this.message = message;
  }
}

export class PayloadToolLargeError extends AppError {
  constructor(message: string){
    super(message, 413);
    this.name = 'PayloadTooLargeError';
    this.message = message;
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message: string){
    super(message, 415);
    this.name = 'UnsupportedMediaTypeError';
    this.message = message;
  }
}