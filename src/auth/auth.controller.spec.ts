import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.register', async () => {
    const dto = {
      username: 'ahmed',
      email: 'ahmed@mail.com',
      password: 'secret123',
    };
    authService.register.mockResolvedValue({ id: 1 });

    await controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should call authService.login', async () => {
    const dto = {
      email: 'ahmed@mail.com',
      password: 'secret123',
    };
    authService.login.mockResolvedValue({ id: 1 });

    await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });
});
