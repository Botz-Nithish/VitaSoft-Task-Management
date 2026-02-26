import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @param dto - {RegisterDto} registration payload (name: string, email: string, password: string)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  register(@Body() dto: RegisterDto): Promise<{ message: string; userId: string; name: string }> {
    return this.authService.register(dto);
  }

  /**
   * @param dto - {LoginDto} login credentials (email: string, password: string)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive a JWT' })
  @ApiResponse({ status: 200, description: 'Login successful, returns access token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  login(@Body() dto: LoginDto): Promise<{ accessToken: string; userId: string; email: string; name: string }> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout (client-side token discard)' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  logout(): { message: string } {
    return { message: 'Logged out successfully' };
  }
}
