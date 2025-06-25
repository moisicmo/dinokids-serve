import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestInfo {
  ipAddress: string;
  userAgent: string;
}

export const RequestInfo = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestInfo => {
    const request = ctx.switchToHttp().getRequest();

    const ipAddress =
      request.headers['x-forwarded-for'] ||
      request.ip ||
      request.connection.remoteAddress ||
      '';

    const userAgent = request.headers['user-agent'] || '';

    return {
      ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
      userAgent,
    };
  },
);