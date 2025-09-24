import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public, RequestInfo } from '@/decorator';
import { CreateRefreshDto } from './dto/create-refresh.dto';
import { ValidatePinDto } from './dto/validate-pin.dto';

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

  @Public()
  @Get('sendPin/:idUser')
  SendPin(@Param('idUser') idUser: string){
    return this.authService.sendPinEmail(idUser);
  }


  @Public()
  @Post('validatePin')
  validationPin(@Body() validatePinDto: ValidatePinDto) {
    return this.authService.validationPin(validatePinDto);
  }
  
}
