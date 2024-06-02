import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as generateTokens from './utils/generateTokens.utils';

import { JwtService } from '@nestjs/jwt';
import { SignUpRequestBody } from './dto/signUpRequestBody.dto';
import { HttpStatus } from '@nestjs/common';
import exp from 'constants';

describe('AuthService', () => {
  let service: AuthService;
  let model: any;

  const mockUserModel = {
    startSession: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    create: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const hashPassword = async (password: string) => {
    return bcrypt.hash(password, 10);
  };

  const mockTokens = {
    accessToken: 'mockedAccessToken',
    refreshToken: 'mockedRefreshToken',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    model = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sign up a new user successfully', async () => {
    console.log('Test started');
    const newUser: SignUpRequestBody = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password',
      isAdmin: false,
    };

    model.findOne.mockResolvedValue(null);
    model.create.mockResolvedValue([
      { toObject: jest.fn().mockReturnValue(newUser) },
    ]);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
    jest.spyOn(generateTokens, 'generateTokens').mockResolvedValue(mockTokens);

    const result = await service.signUp(newUser);

    expect(model.startSession).toHaveBeenCalled();
    expect(model.startTransaction).toHaveBeenCalled();
    expect(model.findOne).toHaveBeenCalledWith({ email: newUser.email });
    expect(model.create).toHaveBeenCalledWith(
      [
        {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          password: 'hashedPassword',
          userRole: undefined,
        },
      ],
      expect.any(Object),
    );
    expect(generateTokens.generateTokens).toHaveBeenCalledWith(newUser);
    expect(model.commitTransaction).toHaveBeenCalled();
    expect(model.endSession).toHaveBeenCalled();

    expect(result).toEqual({
      data: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        tokens: mockTokens,
      },
      message: 'Sign Up successfully!',
      isSuccess: true,
      statusCode: HttpStatus.OK,
    });
    console.log('Test finished');
  });

  it('should return an error if the user already exists', async () => {
    const newUser: SignUpRequestBody = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password',
      isAdmin: false,
    };

    model.findOne.mockResolvedValue(newUser);

    const result = await service.signUp(newUser);

    expect(model.startSession).toHaveBeenCalled();
    expect(model.startTransaction).toHaveBeenCalled();
    expect(model.findOne).toHaveBeenCalledWith({ email: newUser.email });
    expect(model.create).not.toHaveBeenCalled();
    expect(model.abortTransaction).toHaveBeenCalled();
    expect(model.endSession).toHaveBeenCalled();

    expect(result).toEqual({
      data: null,
      isSuccess: false,
      message: 'This email is already registered!',
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('should handle errors during sign up', async () => {
    const newUser: SignUpRequestBody = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password',
      isAdmin: false,
    };

    model.findOne.mockRejectedValue(new Error('Database error'));

    const result = await service.signUp(newUser);

    expect(model.startSession).toHaveBeenCalled();
    expect(model.startTransaction).toHaveBeenCalled();
    expect(model.findOne).toHaveBeenCalledWith({ email: newUser.email });
    expect(model.create).not.toHaveBeenCalled();
    expect(model.abortTransaction).toHaveBeenCalled();
    expect(model.endSession).toHaveBeenCalled();

    expect(result).toEqual({
      data: null,
      isSuccess: false,
      message: 'Database error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });
});
