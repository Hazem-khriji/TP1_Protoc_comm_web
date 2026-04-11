import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Request()
    req?: {
      user?: {
        id: number;
        username: string;
        email: string;
        role: UserRole;
      };
    },
  ) {
    return this.authService.login(req?.user ?? loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(
    @Request()
    req: {
      user: {
        userId: number;
        email: string;
        role: string;
      };
    },
  ) {
    return req.user;
  }
}
