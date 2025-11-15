import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { User } from '../user/entities/user.entity';

describe('EmployeeModule (shallow)', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        EmployeeService,
        { provide: getRepositoryToken(Employee), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
