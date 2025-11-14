import { Test, TestingModule } from '@nestjs/testing';
import { DocumentModule } from './document.module';

describe('DocumentModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DocumentModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
