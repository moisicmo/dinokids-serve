import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RequestInfo } from '@/decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RoleEntity } from '@/modules/role/entities/role.entity';
import { BranchEntity } from '@/modules/branch/entities/branch.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './entities/jwt-payload.interface';
import { CreateRefreshDto } from './dto/create-refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
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
              // active: true,
            },
          },
          role: {
            select: RoleEntity,
          },
          branches: {
            select: BranchEntity,
          },
        },
      });

      if (!staff || !staff.user) {
        throw new NotFoundException('Las credenciales no son válidas, por favor verifica tu correo y contraseña');
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
      };

      const token = this.signJWT(tokenPayload);
      const refreshToken = this.signJWT(tokenPayload, '1d');

      await this.prisma.authSession.create({
        data: {
          userId: user.id,
          token,
          userAgent,
          ipAddress,
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


}
