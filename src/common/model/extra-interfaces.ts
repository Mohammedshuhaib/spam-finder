import { HttpStatus } from '@nestjs/common';

export interface CustomeHttpExceptionResponse {
  status: string;
  data: null;
  error: HttpStatus;
  error_message: string;
  message: string;
}
