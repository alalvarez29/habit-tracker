import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

const COOKIE_NAME = 'access_token';
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const session = await this.authService.register(dto);
    this.setCookie(res, session.accessToken);
    return { id: session.userId, email: session.email };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const session = await this.authService.login(dto.email, dto.password);
    this.setCookie(res, session.accessToken);
    return { id: session.userId, email: session.email };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, this.cookieOptions());
    return { success: true };
  }

  @Get('me')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  private setCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
      ...this.cookieOptions(),
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  private cookieOptions() {
    const isSecure = process.env.COOKIE_SECURE === 'true';
    return {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? ('none' as const) : ('lax' as const),
      path: '/',
    };
  }
}
