import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RequestInfo } from '@/decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RoleSelect } from '@/modules/role/entities/role.entity';
import { BranchSelect } from '@/modules/branch/entities/branch.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './entities/jwt-payload.interface';
import { CreateRefreshDto } from './dto/create-refresh.dto';
import { randomUUID } from 'crypto';
import { GmailService } from '@/common/gmail/gmail.service';
import { ValidatePinDto } from './dto/validate-pin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly gmailService: GmailService,
  ) { }

  signJWT(payload: JwtPayload, expiresIn?: string | number) {
    if (expiresIn) return this.jwtService.sign(payload, { expiresIn });
    return this.jwtService.sign(payload);
  }

  async login(createAuthDto: CreateAuthDto, requestInfo: RequestInfo) {
    const { email, password } = createAuthDto;
    const { userAgent, ipAddress } = requestInfo;

    try {
      const staff = await this.prisma.staff.findFirst({
        where: {
          user: { email },
        },
        select: {
          user: {
            select: {
              password: true,
              id: true,
              name: true,
              lastName: true,
              email: true,
              emailValidated: true,
            },
          },
          role: {
            select: RoleSelect,
          },
          branches: {
            select: BranchSelect,
          },
        },
      });


      if (!staff || !staff.user) {
        throw new NotFoundException('Las credenciales no son válidas, por favor verifica tu correo y contraseña');
      }
      if (!staff.user.emailValidated) {
        throw new UnauthorizedException({ idUser: staff.user.id, key: 'validar correo',email: staff.user.email });
      }

      const isPasswordValid = bcrypt.compareSync(password, staff.user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Las credenciales no son válidas, por favor verifica tu correo y contraseña');
      }

      const { user, role, branches } = staff;

      const tokenPayload = {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        jti: randomUUID(),
      };

      const token = this.signJWT(tokenPayload);
      const refreshToken = this.signJWT(tokenPayload, '1d');

      await this.prisma.authSession.create({
        data: {
          userId: user.id,
          token,
          userAgent,
          ipAddress,
          createdById: user.id,
        },
      });

      return {
        ...tokenPayload,
        token,
        refreshToken,
        role,
        branches,
      };

    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error; // Propaga tal cual los errores esperados
      }

      // Otros errores inesperados sí se tratan como 500
      console.error('Unexpected error in login:', error);
      throw new InternalServerErrorException('Internal server error');
    }

  }

  refreshToken(createRefreshDto: CreateRefreshDto) {
    try {
      const payload = this.jwtService.verify(createRefreshDto.refreshToken);

      const { exp: _, iat: __, nbf: ___, ...cleanPayload } = payload;

      const newAccessToken = this.signJWT(cleanPayload);

      return { token: newAccessToken };

    } catch (error) {
      console.error('refreshToken error:', error);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async sendPinEmail(idUser: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: idUser },
        select: { email: true },
      });

      if (!user?.email) {
        throw new BadRequestException('El usuario no tiene correo registrado');
      }
      const pin = Math.floor(100000 + Math.random() * 900000).toString();

      const salt = bcrypt.genSaltSync(10);
      const hashedPin = bcrypt.hashSync(pin, salt);
      await this.prisma.user.update({
        where: { id: idUser },
        data: { codeValidation: hashedPin },
      });

      // Enviar correo
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
          <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div style="background:#f2f2f2; padding:20px; text-align:center;">
              <img src="cid:logo" alt="Logo" style="height:50px;"/>
            </div>
            <div style="padding:30px; text-align:center;">
              <h2 style="color:#333;">Tu PIN de verificación</h2>
              <p style="font-size:16px; color:#555;">Hola, este es tu código de verificación:</p>
              <p style="font-size:32px; font-weight:bold; letter-spacing:4px; color:#004aad; margin:20px 0;">
                ${pin}
              </p>
              <p style="font-size:14px; color:#888;">Si no solicitaste este código, ignora este mensaje.</p>
            </div>
            <div style="background:#f1f1f1; padding:10px; text-align:center; font-size:12px; color:#666;">
              © 2025 DinoKids. Todos los derechos reservados.
            </div>
          </div>
        </div>
      `;

      await this.gmailService.sendEmail(
        user.email,
        'Tu PIN de verificación',
        htmlMessage,
      );

      return { success: true, message: 'PIN enviado al correo' };
      // ⚠️ quita el pin de la respuesta si no quieres exponerlo
    } catch (error) {
      console.error('sendPinEmail error:', error);
      throw new BadRequestException('No se pudo enviar el PIN');
    }
  }

  async validationPin(validatePinDto: ValidatePinDto) {
    try {
      console.log(validatePinDto);
      const { idUser, pin, newPassword } = validatePinDto;

      const user = await this.prisma.user.findUnique({
        where: { id: idUser },
        select: { email: true, codeValidation: true, },
      });

      if (!user?.email && !user?.codeValidation) {
        throw new BadRequestException('El usuario no tiene correo registrado o pin solicitado');
      }

      const isPinValid = bcrypt.compareSync(pin, user.codeValidation!);
      if (!isPinValid) {
        throw new UnauthorizedException('El PIN no coinside, revisa tu correo');
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);
      await this.prisma.user.update({
        where: { id: idUser },
        data: {
          emailValidated: true,
          password: hashedPassword,
        },
      });

      return { success: true, message: 'Cuenta valida' };

    } catch (error) {
      console.error('validationPin error:', error);
      throw new BadRequestException('No se pudo validar el PIN');
    }
  }


}
