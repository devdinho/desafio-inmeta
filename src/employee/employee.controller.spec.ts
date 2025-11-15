import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { DocumentRequestService } from '../document/document.service';
import { ResponseEmployeeDto } from './dto/response-employee.dto';

describe('EmployeeController (unit)', () => {
  let controller: EmployeeController;
  let service: Partial<Record<keyof EmployeeService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 1, name: 'John' }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'John' }),
      update: jest.fn().mockResolvedValue({ id: 1, name: 'John Updated' }),
      remove: jest.fn().mockResolvedValue({ affected: 1 }),
    } as any;

    const docServiceMock = {
      getEmployeeDocumentStatus: jest.fn().mockResolvedValue({}),
    } as Partial<Record<keyof DocumentRequestService, jest.Mock>>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        { provide: EmployeeService, useValue: service },
        { provide: DocumentRequestService, useValue: docServiceMock },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('returns created employee transformed to DTO', async () => {
      const dto = {
        name: 'John',
        user: { email: 'a@b.com', username: 'john', password: 'pw' },
        hiredAt: new Date(),
      } as any;
      const res = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('returns array of employees', async () => {
      const res = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(Array.isArray(res)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('returns a single employee by id', async () => {
      const res = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(res).toHaveProperty('id', 1);
    });
  });

  describe('update', () => {
    it('updates and returns employee DTO', async () => {
      const dto = { name: 'John Updated' } as any;
      const res = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(res).toHaveProperty('name', 'John Updated');
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
