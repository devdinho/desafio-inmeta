import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'access-secret',
    });
  }

  async validate(payload: any) {
    // busca o usuário completo no banco para anexar a req.user
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) return null;

    // não devolvemos a senha
    const { password, ...rest } = user as any;
    return rest;
  }
}
