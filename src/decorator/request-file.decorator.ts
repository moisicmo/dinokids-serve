import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileMimeTypeInterceptor implements NestInterceptor {
  constructor(private readonly validMimeTypes: string[]) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (file && !this.validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Image must be of type: ${this.validMimeTypes.join(', ')}`);
    }

    return next.handle();
  }
}
