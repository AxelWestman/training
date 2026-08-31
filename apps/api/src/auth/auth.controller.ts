import {
  Controller,
  Post,
  Body,
  Res,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, LoginResponseDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Log in and set the session cookie' })
  @ApiResponse({
    status: 200,
    description: 'Logged in user (session cookie is set in the response)',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    response.cookie('session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return result.user;
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Log out and clear the session cookie' })
  @ApiResponse({ status: 200, description: 'Logout confirmation' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}
