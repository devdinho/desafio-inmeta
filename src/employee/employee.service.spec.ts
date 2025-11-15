import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { User } from '../user/entities/user.entity';

describe('EmployeeService (unit)', () => {
  let service: EmployeeService;
  let mockEmployeeRepo: any;
  let mockUserRepo: any;

  beforeEach(async () => {
    mockEmployeeRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 1, ...entity })),
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn().mockResolvedValue(null),
      findOne: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mockUserRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((user) => Promise.resolve({ id: 2, ...user })),
      findOne: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: getRepositoryToken(Employee), useValue: mockEmployeeRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates an employee and user', async () => {
      const dto = {
        name: 'John Doe',
        user: { email: 'john@example.com', username: 'john', password: 'pw' },
        hiredAt: new Date('2023-01-01'),
      } as any;

      mockUserRepo.save = jest.fn().mockResolvedValue({ id: 2, ...dto.user });
      mockEmployeeRepo.save = jest.fn().mockResolvedValue({
        id: 1,
        name: dto.name,
        hiredAt: dto.hiredAt,
        user: { id: 2, ...dto.user },
      });

      const result = await service.create(dto);

      expect(mockUserRepo.create).toHaveBeenCalledWith(dto.user);
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockEmployeeRepo.create).toHaveBeenCalled();
      expect(mockEmployeeRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('user');
    });
  });

  describe('findAll', () => {
    it('returns all employees', async () => {
      const employees = [{ id: 1, name: 'A' }];
      mockEmployeeRepo.find = jest.fn().mockResolvedValue(employees);
      const res = await service.findAll();
      expect(res).toBe(employees);
      expect(mockEmployeeRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns one employee when found', async () => {
      const employee = { id: 1, name: 'A' };
      mockEmployeeRepo.findOneBy = jest.fn().mockResolvedValue(employee);
      const res = await service.findOne(1);
      expect(res).toEqual(employee);
      expect(mockEmployeeRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('update', () => {
    it('updates employee and user data', async () => {
      const existing = {
        id: 1,
        name: 'Old',
        hiredAt: new Date('2020-01-01'),
        user: { id: 2, email: 'old@example.com', username: 'old' },
      };
      mockEmployeeRepo.findOne = jest.fn().mockResolvedValue(existing);
      mockUserRepo.findOne = jest.fn().mockResolvedValue(null);
      mockUserRepo.save = jest.fn().mockResolvedValue({
        id: 2,
        email: 'new@example.com',
        username: 'new',
      });
      mockEmployeeRepo.save = jest
        .fn()
        .mockResolvedValue({ ...existing, name: 'New' });

      const dto = {
        user: { email: 'new@example.com', username: 'new', password: 'pw' },
        name: 'New',
        hiredAt: new Date('2021-01-01'),
      } as any;

      const res = await service.update(1, dto);

      expect(mockEmployeeRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockEmployeeRepo.save).toHaveBeenCalled();
      expect(res).toHaveProperty('name', 'New');
    });
  });

  describe('remove', () => {
    it('removes employee and associated user', async () => {
      const existing = { id: 1, userId: 2 };
      mockEmployeeRepo.findOneBy = jest.fn().mockResolvedValue(existing);
      mockUserRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });
      mockEmployeeRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });

      const res = await service.remove(1);

      expect(mockEmployeeRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockUserRepo.delete).toHaveBeenCalledWith({ id: 2 });
      expect(mockEmployeeRepo.delete).toHaveBeenCalledWith(1);
      expect(res).toHaveProperty('affected');
    });
  });
});
