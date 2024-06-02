import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import ClientResponse from '../../common/interfaces/clientResponse.interface';
import SignUpInResponse from './types/signUpResponse.type';
import { SignUpRequestBody } from './dto/signUpRequestBody.dto';
import { SignInRequestBody } from './dto/signInRequestBody.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const responseMock = {
    firstName: 'Juan',
    lastName: 'Doe',
    email: 'juan@test.com',
    tokens: {
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should be create a Regular User', async () => {
      const newUser: SignUpRequestBody = {
        firstName: 'Juan',
        lastName: 'Doe',
        email: 'juan@test.com',
        password: 'password',
        isAdmin: false,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response<ClientResponse<SignUpInResponse>>;

      const results = {
        data: responseMock,
        message: 'Sign Up successfully!',
        isSuccess: true,
        statusCode: 200,
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(results);

      await controller.signUp(res, newUser);

      expect(authService.signUp).toHaveBeenCalledWith(newUser);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(results);
    });

    it('should be create an Admin User', async () => {
      const newUser: SignUpRequestBody = {
        firstName: 'Juan',
        lastName: 'Doe',
        email: 'juan@test.com',
        password: 'password',
        isAdmin: true,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response<ClientResponse<SignUpInResponse>>;

      const results = {
        data: responseMock,
        message: 'Sign Up successfully!',
        isSuccess: true,
        statusCode: 200,
      };

      jest.spyOn(authService, 'signUp').mockResolvedValue(results);

      await controller.signUp(res, newUser);

      expect(authService.signUp).toHaveBeenCalledWith(newUser);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(results);
    });
  });

  describe('signIn', () => {
    it('should signIn a User', async () => {
      const newUser: SignInRequestBody = {
        email: 'juan@test.com',
        password: 'password',
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response<ClientResponse<SignUpInResponse>>;

      const results = {
        data: responseMock,
        message: 'Sign In successfully!',
        isSuccess: true,
        statusCode: 200,
      };

      jest.spyOn(authService, 'signIn').mockResolvedValue(results);

      await controller.signIn(res, newUser);

      expect(authService.signIn).toHaveBeenCalledWith(newUser);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(results);
    });
  });
});
