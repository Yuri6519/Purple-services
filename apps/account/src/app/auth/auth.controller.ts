import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Get('echo')
  public echo(): string {
    return this.authService.getEcho();
  }

  @Post('register')
  public async register(@Body() dto: RegisterDto) {
    try {
      return await this.authService.register(dto);
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  @Post('login')
  public async login(@Body() dto: LoginDto) {
    try {
      const { id } = await this.authService.validate(dto);
      return await this.authService.authorize(id);
    } catch (e) {
      throw new HttpException(e.message, 401);
    }
  }
}
