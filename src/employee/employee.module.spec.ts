import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeModule } from './employee.module';

describe('EmployeeModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [EmployeeModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
