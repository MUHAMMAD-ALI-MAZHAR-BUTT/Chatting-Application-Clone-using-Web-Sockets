import { Body, Controller, Post, ValidationPipe, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto } from 'src/dto/user-register.dto';
import { LoginDto } from 'src/dto/login.dto';
import { UserTokenDto } from 'src/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() userDto: UserRegisterDto): Promise<any> {
    try {
      await this.authService.register(userDto);
      return { message: 'User registered successfully', success: true };
    } catch (error) {
      return { message: error.message, success: false };
    }
  }

  @Post('login')
  async login(
    @Body(ValidationPipe) loginUserDto: LoginDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.login(loginUserDto);
  }

  @Post('details')
  async getUserDetails(@Body() userTokenDto: UserTokenDto) {
    return this.authService.getUserDetails(userTokenDto.token);
  }
  @Get('users')
  async findAll(): Promise<{ id: string; username: string }[]> {
    return this.authService.findAll();
  }
}
