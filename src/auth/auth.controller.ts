import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import { CurrentUser } from './user.decorator';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email or username' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identifier: { type: 'string', example: 'admin@example.com' },
        password: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Returns access token' })
  @Public()
  login(@Body() body: { identifier: string; password: string }) {
    return this.authService.login(body.identifier, body.password);
  }

  

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Returns new access and refresh tokens' })
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a refresh token (logout) — requires access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Refresh token revoked' })
  logout(@Body() body: { refreshToken: string }, @CurrentUser() user?: any) {
    const userId = user?.id;
    return this.authService.logout(body.refreshToken, userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@CurrentUser() user: any) {
    return user;
  }
}
