import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { CurrentUser, Public, RequestInfo } from '@/decorator';
import { CreateRefreshDto } from './dto/create-refresh.dto';
import { ValidatePinDto } from './dto/validate-pin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { JwtPayload } from './entities/jwt-payload.interface';

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

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() currentUser: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(currentUser.id, dto);
  }

  @Patch('password')
  updatePassword(@CurrentUser() currentUser: JwtPayload, @Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(currentUser.id, dto);
  }

}
