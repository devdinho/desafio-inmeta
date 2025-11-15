import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController (unit)', () => {
  let controller: UserController;
  let service: Partial<Record<keyof UserService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 1, username: 'u' }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 1, username: 'u' }),
      update: jest.fn().mockResolvedValue({ id: 1, username: 'u2' }),
      remove: jest.fn().mockResolvedValue({ affected: 1 }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: service }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('calls service.create', async () => {
      const dto = { email: 'a@b.com', username: 'u', password: 'pw' } as any;
      const res = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('returns an array', async () => {
      const res = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(Array.isArray(res)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('returns a user by id', async () => {
      const res = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(res).toHaveProperty('id', 1);
    });
  });

  describe('update', () => {
    it('updates and returns user', async () => {
      const dto = { username: 'u2' } as any;
      const res = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(res).toHaveProperty('username', 'u2');
    });
  });

  describe('remove', () => {
    it('calls remove on service', async () => {
      const res = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(res).toEqual({ affected: 1 });
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
