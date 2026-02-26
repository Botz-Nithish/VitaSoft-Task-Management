import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, RequestUser } from '../interfaces/authenticated-request.interface';

export const GetUser = createParamDecorator(
  // _data is the decorator's optional metadata arg — unused but required by NestJS param decorator signature
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
