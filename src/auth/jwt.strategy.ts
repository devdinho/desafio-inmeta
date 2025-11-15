import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'access-secret';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // busca o usuário completo no banco para anexar a req.user
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) return null;

    // não devolvemos a senha
    const { password, ...rest } = user as any;
    
    // determine role: prioridade admin > recruiter > employee
    const result: any = { ...rest };
    
    // 1. Admin tem prioridade máxima
    if ((rest as any).isAdmin) {
      result.role = 'admin';
      return result;
    }
    
    // 2. Staff/Recruiter tem segunda prioridade
    if ((rest as any).isStaff) {
      result.role = 'recruiter';
      return result;
    }
    
    // 3. Se não é admin nem staff, verifica se é employee
    try {
      const employee = await this.employeeRepository.findOne({ where: { user: { id: user.id } as any } as any });
      if (employee) {
        result.role = 'employee';
        return result;
      }
    } catch (e) {
      // Silently handle employee lookup errors
    }

    return result;
  }
}
