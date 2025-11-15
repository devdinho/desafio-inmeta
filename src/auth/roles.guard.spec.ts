import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('allows access when no roles are required', () => {
      const mockContext = createMockExecutionContext({});
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('allows access when required roles array is empty', () => {
      const mockContext = createMockExecutionContext({});
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('denies access when user is not authenticated', () => {
      const mockContext = createMockExecutionContext({ user: null });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('denies access when user has no role', () => {
      const mockContext = createMockExecutionContext({ user: { id: 1, email: 'test@test.com' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('allows access when user has required role (admin)', () => {
      const mockContext = createMockExecutionContext({ user: { id: 1, role: 'admin' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('allows access when user has required role (recruiter)', () => {
      const mockContext = createMockExecutionContext({ user: { id: 2, role: 'recruiter' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['recruiter']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('allows access when user has required role (employee)', () => {
      const mockContext = createMockExecutionContext({ user: { id: 3, role: 'employee' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['employee']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('denies access when user role does not match required role', () => {
      const mockContext = createMockExecutionContext({ user: { id: 4, role: 'employee' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('allows access when user role matches one of multiple required roles', () => {
      const mockContext = createMockExecutionContext({ user: { id: 5, role: 'recruiter' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['recruiter', 'admin']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('allows admin to access recruiter-only endpoint', () => {
      const mockContext = createMockExecutionContext({ user: { id: 6, role: 'admin' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['recruiter', 'admin']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('denies employee access to recruiter-only endpoint', () => {
      const mockContext = createMockExecutionContext({ user: { id: 7, role: 'employee' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['recruiter', 'admin']);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('reads roles metadata from handler and class', () => {
      const mockContext = createMockExecutionContext({ user: { id: 8, role: 'admin' } });
      const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      guard.canActivate(mockContext);

      expect(spy).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });
});

// Helper function to create mock ExecutionContext
function createMockExecutionContext(requestData: any): ExecutionContext {
  const request = { user: requestData.user };
  
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getType: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  } as any;
}
