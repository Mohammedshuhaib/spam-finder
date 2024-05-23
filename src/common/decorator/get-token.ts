import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetToken = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!data) request.user;
    return request.user[data];
  },
);
