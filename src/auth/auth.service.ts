import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, pass: string) {
    const user = await this.userRepo.findOne({
      where: [{ email: identifier }, { username: identifier }],
    });

    if (!user) return null;

    const valid = await bcrypt.compare(pass, user.password);
    return valid ? user : null;
  }

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      isStaff: user.isStaff,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: '7d',
    });

    // persist hashed refresh token
    const hashed = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.save({ tokenHash: hashed, user, expiresAt });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('refreshToken é obrigatório');

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });
    } catch (err) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    // find stored refresh tokens for user and verify
    const stored = await this.refreshTokenRepo.find({ where: { user: { id: user.id } } as any });
    let match: RefreshToken | undefined;
    for (const t of stored) {
      const ok = await bcrypt.compare(refreshToken, (t as any).tokenHash);
      if (ok) {
        match = t;
        break;
      }
    }

    if (!match) throw new UnauthorizedException('Refresh token não encontrado');

    // remove the used token (rotation)
    await this.refreshTokenRepo.remove(match as any);

    const newPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      isStaff: user.isStaff,
    };

    const accessToken = this.jwtService.sign(newPayload);
    const newRefreshToken = this.jwtService.sign(newPayload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: '7d',
    });

    const newHashed = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.save({ tokenHash: newHashed, user, expiresAt });

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('refreshToken é obrigatório');

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });
    } catch (err) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const stored = await this.refreshTokenRepo.find({ where: { user: { id: user.id } } as any });
    let match: RefreshToken | undefined;
    for (const t of stored) {
      const ok = await bcrypt.compare(refreshToken, (t as any).tokenHash);
      if (ok) {
        match = t;
        break;
      }
    }

    if (!match) throw new UnauthorizedException('Refresh token não encontrado');

    await this.refreshTokenRepo.remove(match as any);

    return { revoked: true };
  }
}
