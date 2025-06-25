import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public, RequestInfo } from '@/decorator';
import { CreateRefreshDto } from './dto/create-refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  login(@Body() createAuthDto: CreateAuthDto, @RequestInfo() requestInfo: RequestInfo) {
    return this.authService.login(createAuthDto,requestInfo);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() createRefreshDto: CreateRefreshDto) {
    return this.authService.refreshToken(createRefreshDto);
  }
}
