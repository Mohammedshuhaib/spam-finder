import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomeHttpExceptionResponse } from '../model/extra-interfaces';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status: string = exception.response?.status || 'failure';
    let error: HttpStatus =
      exception.response?.error || HttpStatus.INTERNAL_SERVER_ERROR;
    const errorMessage: string =
      exception.response?.error_message || exception.message;
    let message: string = exception?.message || 'Something went wrong';
    switch (exception.status || exception.code) {
      case '23505':
        error = HttpStatus.CONFLICT;
        message = 'Entity already exist';
        break;
      case 20404:
        error = HttpStatus.BAD_REQUEST;
        message = 'Otp expired, Please resend';
        break;
      case HttpStatus.NOT_FOUND:
        error = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
        break;
      case HttpStatus.BAD_REQUEST:
        error = HttpStatus.BAD_REQUEST;
        message = exception.response.message || 'Please check the parameters';
        break;
      case HttpStatus.UNAUTHORIZED:
        error = HttpStatus.UNAUTHORIZED;
        message = 'You are not authorized to contact the api';
        break;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        error = HttpStatus.UNPROCESSABLE_ENTITY;
        message = 'Unable to process';
        break;
    }
    const errorResponse = this.getErrorResponse(
      errorMessage,
      error,
      message,
      status,
    );
    response.status(error).json(errorResponse);
  }

  private getErrorResponse = (
    errorMessage: string,
    error: HttpStatus,
    message: string,
    status: string,
  ): CustomeHttpExceptionResponse => ({
    status: status,
    data: null,
    message: message,
    error: error,
    error_message: errorMessage,
  });
}
