import { HttpStatus } from '@nestjs/common';

export default class ControlledException {
  message: string;
  statusCode: HttpStatus;

  constructor(message: string, statusCode: HttpStatus) {
    this.message = message;
    this.statusCode = statusCode;
  }
}
