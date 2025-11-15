import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../user/entities/user.entity';
import { Employee } from '../employee/entities/employee.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUserRepo: any;
  let mockEmployeeRepo: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockUserRepo = {
      findOne: jest.fn(),
    };

    mockEmployeeRepo = {
      findOne: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('returns null when user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await strategy.validate({ sub: 999 });

      expect(result).toBeNull();
    });

    it('assigns role "admin" when user is admin (highest priority)', async () => {
      const user = {
        id: 1,
        email: 'admin@test.com',
        username: 'admin',
        password: 'hashed',
        isAdmin: true,
        isStaff: false,
        isActive: true,
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockEmployeeRepo.findOne.mockResolvedValue({ id: 10, userId: 1 }); // Even has Employee

      const result = await strategy.validate({ sub: 1 });

      expect(result.role).toBe('admin');
      expect(result.password).toBeUndefined(); // Password excluded
    });

    it('assigns role "recruiter" when user is staff (second priority)', async () => {
      const user = {
        id: 2,
        email: 'recruiter@test.com',
        username: 'recruiter',
        password: 'hashed',
        isAdmin: false,
        isStaff: true,
        isActive: true,
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockEmployeeRepo.findOne.mockResolvedValue({ id: 20, userId: 2 }); // Even has Employee

      const result = await strategy.validate({ sub: 2 });

      expect(result.role).toBe('recruiter');
      expect(result.password).toBeUndefined();
    });

    it('assigns role "employee" when user has Employee and is not admin/staff', async () => {
      const user = {
        id: 3,
        email: 'employee@test.com',
        username: 'employee',
        password: 'hashed',
        isAdmin: false,
        isStaff: false,
        isActive: true,
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockEmployeeRepo.findOne.mockResolvedValue({ id: 30, userId: 3 });

      const result = await strategy.validate({ sub: 3 });

      expect(result.role).toBe('employee');
      expect(result.password).toBeUndefined();
    });

    it('returns user without role when user has no admin/staff/employee status', async () => {
      const user = {
        id: 4,
        email: 'basic@test.com',
        username: 'basic',
        password: 'hashed',
        isAdmin: false,
        isStaff: false,
        isActive: true,
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockEmployeeRepo.findOne.mockResolvedValue(null); // No Employee

      const result = await strategy.validate({ sub: 4 });

      expect(result.role).toBeUndefined();
      expect(result.password).toBeUndefined();
    });

    it('handles employee lookup error gracefully', async () => {
      const user = {
        id: 5,
        email: 'test@test.com',
        username: 'test',
        password: 'hashed',
        isAdmin: false,
        isStaff: false,
        isActive: true,
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockEmployeeRepo.findOne.mockRejectedValue(new Error('DB error'));

      const result = await strategy.validate({ sub: 5 });

      expect(result).toBeDefined();
      expect(result.role).toBeUndefined();
    });

    it('excludes password from returned user object', async () => {
      const user = {
        id: 6,
        email: 'user@test.com',
        username: 'user',
        password: 'this-should-not-appear',
        isAdmin: false,
        isStaff: false,
        isActive: true,
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockEmployeeRepo.findOne.mockResolvedValue(null);

      const result = await strategy.validate({ sub: 6 });

      expect(result.password).toBeUndefined();
      expect(result.email).toBe('user@test.com');
    });
  });

  describe('role hierarchy', () => {
    it('admin takes precedence over staff', async () => {
      const user = {
        id: 7,
        email: 'both@test.com',
        username: 'both',
        password: 'hashed',
        isAdmin: true,
        isStaff: true, // Both flags set
        isActive: true,
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockEmployeeRepo.findOne.mockResolvedValue(null);

      const result = await strategy.validate({ sub: 7 });

      expect(result.role).toBe('admin'); // Admin wins
    });

    it('staff takes precedence over employee', async () => {
      const user = {
        id: 8,
        email: 'staff-emp@test.com',
        username: 'staffemp',
        password: 'hashed',
        isAdmin: false,
        isStaff: true,
        isActive: true,
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      mockEmployeeRepo.findOne.mockResolvedValue({ id: 80, userId: 8 }); // Has Employee

      const result = await strategy.validate({ sub: 8 });

      expect(result.role).toBe('recruiter'); // Staff/recruiter wins over employee
    });
  });
});
