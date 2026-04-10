import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export interface AuthUserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(registerDto: RegisterPayload): Promise<AuthUserResponse> {
    let emailAlreadyExists = false;

    try {
      await this.userService.findOneByEmail(registerDto.email);
      emailAlreadyExists = true;
    } catch (error) {
      // If the user is not found, we can proceed with registration.
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    if (emailAlreadyExists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const createdUser = await this.userService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
    });

    return this.buildAuthUserResponse(createdUser);
  }

  async login(loginDto: LoginPayload): Promise<AuthUserResponse> {
    const user = await this.userService.findOneByEmail(loginDto.email);
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthUserResponse(user);
  }

  private buildAuthUserResponse(user: {
    id: number;
    username: string;
    email: string;
    role: UserRole;
  }): AuthUserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
