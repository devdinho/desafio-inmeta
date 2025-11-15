import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

describe('UserService (unit)', () => {
  let service: UserService;
  let mockUserRepo: any;

  beforeEach(async () => {
    mockUserRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((user) => Promise.resolve({ id: 1, ...user })),
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a user', async () => {
      const dto = { email: 'a@b.com', username: 'u', password: 'pw' } as any;
      mockUserRepo.create = jest.fn((d) => d);
      mockUserRepo.save = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const res = await service.create(dto);

      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ username: dto.username }));
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(res).toHaveProperty('id', 1);
    });
  });

  describe('findAll', () => {
    it('returns all users', async () => {
      const users = [{ id: 1, email: 'a@b.com' }];
      mockUserRepo.find = jest.fn().mockResolvedValue(users);
      const res = await service.findAll();
      expect(res).toBe(users);
      expect(mockUserRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns user when found', async () => {
      const user = { id: 1, email: 'a@b.com' };
      mockUserRepo.findOneBy = jest.fn().mockResolvedValue(user);
      const res = await service.findOne(1);
      expect(res).toEqual(user);
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('throws NotFoundException when not found', async () => {
      mockUserRepo.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns user when exists', async () => {
      const existing = { id: 1, email: 'old@a.com', username: 'old' } as any;
      mockUserRepo.findOneBy = jest.fn().mockResolvedValue(existing);
      mockUserRepo.save = jest.fn().mockResolvedValue({ id: 1, email: 'new@a.com', username: 'new' });

      const dto = { email: 'new@a.com', username: 'new', password: 'pw' } as any;
      const res = await service.update(1, dto);

      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(res).toHaveProperty('email', 'new@a.com');
    });

    it('throws NotFoundException when user missing', async () => {
      mockUserRepo.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.update(2, { email: 'x' } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes user when exists', async () => {
      mockUserRepo.findOneBy = jest.fn().mockResolvedValue({ id: 1 });
      mockUserRepo.delete = jest.fn().mockResolvedValue({ affected: 1 });

      const res = await service.remove(1);
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockUserRepo.delete).toHaveBeenCalledWith(1);
      expect(res).toHaveProperty('affected');
    });

    it('throws NotFoundException when missing', async () => {
      mockUserRepo.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.remove(5)).rejects.toThrow(NotFoundException);
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
