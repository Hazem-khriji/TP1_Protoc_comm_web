import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    create: jest.Mock;
    findOneByEmail: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      create: jest.fn(),
      findOneByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user and not return password', async () => {
    userService.findOneByEmail.mockRejectedValue(new NotFoundException());
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
    userService.create.mockResolvedValue({
      id: 1,
      username: 'ahmed',
      email: 'ahmed@mail.com',
      password: 'hashed-password',
      role: UserRole.USER,
    });

    const result = await service.register({
      username: 'ahmed',
      email: 'ahmed@mail.com',
      password: 'secret123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
    expect(userService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'ahmed',
        email: 'ahmed@mail.com',
        password: 'hashed-password',
      }),
    );
    expect(result).toEqual({
      id: 1,
      username: 'ahmed',
      email: 'ahmed@mail.com',
      role: UserRole.USER,
    });
  });

  it('should throw on invalid login credentials', async () => {
    userService.findOneByEmail.mockResolvedValue({
      id: 1,
      username: 'ahmed',
      email: 'ahmed@mail.com',
      password: 'hashed-password',
      role: UserRole.USER,
    });

    await expect(
      service.login({
        email: 'ahmed@mail.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
