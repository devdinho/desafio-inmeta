import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  } as unknown as AuthService;

  beforeEach(() => {
    controller = new AuthController(mockAuthService);
    jest.clearAllMocks();
  });

  it('should return access and refresh tokens on login', async () => {
    const tokens = { access_token: 'access', refresh_token: 'refresh' };
    (mockAuthService.login as jest.Mock).mockResolvedValue(tokens);

    await expect(
      controller.login({ identifier: 'user@example.com', password: 'pass' }),
    ).resolves.toEqual(tokens);

    expect(mockAuthService.login).toHaveBeenCalledWith('user@example.com', 'pass');
  });

  it('should refresh tokens when refresh endpoint called', async () => {
    const tokens = { access_token: 'new-access', refresh_token: 'new-refresh' };
    (mockAuthService.refresh as jest.Mock).mockResolvedValue(tokens);

    await expect(controller.refresh({ refreshToken: 'old-refresh' })).resolves.toEqual(tokens);
    expect(mockAuthService.refresh).toHaveBeenCalledWith('old-refresh');
  });

  it('me should return the current user object', () => {
    const user = { id: 1, email: 'me@example.com' };
    expect(controller.me(user)).toEqual(user);
  });

  it('should revoke refresh token on logout (requires user)', async () => {
    (mockAuthService.logout as jest.Mock).mockResolvedValue({ revoked: true });
    const user = { id: 1 } as any;
    await expect(controller.logout({ refreshToken: 'rt' }, user)).resolves.toEqual({ revoked: true });
    expect(mockAuthService.logout).toHaveBeenCalledWith('rt', 1);
  });
});
