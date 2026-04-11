import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

type ValidatedUser = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
};

export interface AuthUserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUserResponse;
  accessToken: string;
}

type JwtPayload = {
  sub: number;
  email: string;
  role: UserRole;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterPayload): Promise<AuthResponse> {
    let emailAlreadyExists = false;

    try {
      await this.userService.findOneByEmail(registerDto.email);
      emailAlreadyExists = true;
    } catch (error) {
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

    return this.buildAuthResponse(createdUser);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidatedUser | null> {
    try {
      const user = await this.userService.findOneByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return this.buildAuthUserResponse(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }

      throw error;
    }
  }

  async login(loginInput: LoginPayload | ValidatedUser): Promise<AuthResponse> {
    const user =
      'password' in loginInput
        ? await this.validateUser(loginInput.email, loginInput.password)
        : loginInput;

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: number;
    username: string;
    email: string;
    role: UserRole;
  }): AuthResponse {
    const authUser = this.buildAuthUserResponse(user);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: authUser,
      accessToken: this.jwtService.sign(payload),
    };
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
