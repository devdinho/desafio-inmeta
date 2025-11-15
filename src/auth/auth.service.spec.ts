import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepo: any = {
    findOne: jest.fn(),
  };

  const mockRefreshRepo: any = {
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService: any = {
    sign: jest.fn((payload: any, options?: any) => {
      if (options && options.secret) return 'refresh-token';
      return 'access-token';
    }),
    verify: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockUserRepo, mockRefreshRepo, mockJwtService as any);
  });

  it('login should return tokens and persist hashed refresh token', async () => {
    const user = { id: 1, email: 'a@a.com', username: 'u', isAdmin: false, isStaff: false } as any;
    jest.spyOn(service, 'validateUser' as any).mockResolvedValue(user);

    const res = await service.login('a@a.com', 'pass');

    expect(res).toHaveProperty('access_token', 'access-token');
    expect(res).toHaveProperty('refresh_token', 'refresh-token');
    expect(mockRefreshRepo.save).toHaveBeenCalled();
    const saved = mockRefreshRepo.save.mock.calls[0][0];
    expect(saved).toHaveProperty('tokenHash');
    expect(saved).toHaveProperty('user');
  });

  it('refresh should rotate tokens when provided valid refresh token', async () => {
    const user = { id: 2, email: 'b@b.com', username: 'u2', isAdmin: false, isStaff: false } as any;
    mockJwtService.verify.mockReturnValue({ sub: user.id });
    mockUserRepo.findOne.mockResolvedValue(user);

    const hashed = await bcrypt.hash('valid-refresh', 10);
    mockRefreshRepo.find.mockResolvedValue([{ id: 5, tokenHash: hashed, user, revoked: false }]);
    mockRefreshRepo.save.mockResolvedValue(undefined);

    const res = await service.refresh('valid-refresh');

    expect(mockRefreshRepo.save).toHaveBeenCalled();
    expect(res).toHaveProperty('access_token', 'access-token');
    expect(res).toHaveProperty('refresh_token', 'refresh-token');
  });

  it('refresh should throw when token not found', async () => {
    mockJwtService.verify.mockReturnValue({ sub: 99 });
    mockUserRepo.findOne.mockResolvedValue({ id: 99 } as any);
    mockRefreshRepo.find.mockResolvedValue([]);

    await expect(service.refresh('nope')).rejects.toThrow();
  });

  it('logout should remove stored token when valid', async () => {
    const user = { id: 3 } as any;
    mockJwtService.verify.mockReturnValue({ sub: user.id });
    mockUserRepo.findOne.mockResolvedValue(user);

    const hashed = await bcrypt.hash('to-remove', 10);
    mockRefreshRepo.find.mockResolvedValue([{ id: 9, tokenHash: hashed, user, revoked: false }]);
    mockRefreshRepo.remove.mockResolvedValue(undefined);
    mockRefreshRepo.save.mockResolvedValue(undefined);

    const res = await service.logout('to-remove', 3);
    expect(mockRefreshRepo.save).toHaveBeenCalled();
    expect(res).toEqual({ revoked: true });
  });

  it('logout should throw when token not found', async () => {
    mockJwtService.verify.mockReturnValue({ sub: 100 });
    mockUserRepo.findOne.mockResolvedValue({ id: 100 } as any);
    mockRefreshRepo.find.mockResolvedValue([]);

    await expect(service.logout('nope', 100)).rejects.toThrow();
  });
});
