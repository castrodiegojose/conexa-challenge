import { HttpStatus, Injectable } from '@nestjs/common';
import { SignUpRequestBody } from './dto/signUpRequestBody.dto';
import ClientResponse from '../../common/interfaces/clientResponse.interface';
import SignUpInResponse from './types/signUpResponse.type';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from '../../schemas/user.schema';
import { Model } from 'mongoose';
import ControlledException from '../../common/exceptions/controller.exceptions';
import { comparePasswords, hashPassword } from './utils/hashingPassword.utils';
import { generateTokens } from './utils/generateTokens.utils';
import { SignInRequestBody } from './dto/signInRequestBody.dto';
import { ChangeUserRoleRequestBody } from './dto/changeUserRoleRequestBody.dto';
import ChangeUserRoleResponse from './types/changeUserRoleResponse.type';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async signUp(
    newUser: SignUpRequestBody,
  ): Promise<ClientResponse<SignUpInResponse>> {
    const session = await this.userModel.startSession();
    try {
      session.startTransaction();
      const userExist = !!(await this.userModel.findOne({
        email: newUser.email,
      }));

      if (userExist) {
        throw new ControlledException(
          'This email is already registered!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashUserPassword = await hashPassword(newUser.password);

      const newCostumerResult = await this.userModel.create(
        [
          {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            password: hashUserPassword,
            userRole: newUser.isAdmin ? UserRole.ADMIN : undefined,
          },
        ],
        { session },
      );

      const newCostumer = newCostumerResult[0].toObject();

      const tokens = await generateTokens(newCostumer);

      const response: ClientResponse<SignUpInResponse> = {
        data: {
          firstName: newCostumer.firstName,
          lastName: newCostumer.lastName,
          email: newCostumer.email,
          tokens,
        },
        message: 'Sign Up successfully!',
        isSuccess: true,
        statusCode: HttpStatus.OK,
      };

      await session.commitTransaction();

      return response;
    } catch (error) {
      await session.abortTransaction();
      const message = error.message ?? 'Something went wrong!';

      return {
        data: null,
        isSuccess: false,
        message,
        statusCode: error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      };
    } finally {
      await session.endSession();
    }
  }

  async signIn(
    credentials: SignInRequestBody,
  ): Promise<ClientResponse<SignUpInResponse>> {
    try {
      const { password, email } = credentials;

      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new ControlledException(
          'User not found!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const passwordMatch = await comparePasswords(password, user.password);

      if (!passwordMatch) {
        throw new ControlledException(
          'Wrong password!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const tokens = await generateTokens(user);
      const costumer = user.toObject();

      const response: ClientResponse<SignUpInResponse> = {
        data: {
          firstName: costumer.firstName,
          lastName: costumer.lastName,
          email: costumer.email,
          tokens,
        },
        message: 'Sign In successfully!',
        isSuccess: true,
        statusCode: HttpStatus.OK,
      };

      return response;
    } catch (error) {
      const message = error.message ?? 'Something went wrong!';

      return {
        data: null,
        isSuccess: false,
        message,
        statusCode: error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async changeUserRole(
    userId: string,
    userRole: ChangeUserRoleRequestBody,
  ): Promise<ClientResponse<ChangeUserRoleResponse>> {
    const session = await this.userModel.startSession();
    try {
      session.startTransaction();
      const { email, role } = userRole;

      const userAdmin = await this.userModel.findOne({ _id: userId });

      if (userAdmin.userRole !== UserRole.ADMIN) {
        throw new ControlledException(
          'You are not allowed to change the User Role',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userModel.findOne({ email }).lean();

      if (!user) {
        throw new ControlledException(
          'User does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newUserRole = await this.userModel.findByIdAndUpdate(
        user._id,

        {
          userRole: role,
        },
        { session, new: true },
      );

      const response: ClientResponse<ChangeUserRoleResponse> = {
        data: {
          email: email,
          newRole: newUserRole.userRole,
        },
        message: 'Sign In successfully!',
        isSuccess: true,
        statusCode: HttpStatus.OK,
      };

      await session.commitTransaction();

      return response;
    } catch (error) {
      const message = error.message ?? 'Something went wrong!';
      await session.abortTransaction();

      return {
        data: null,
        isSuccess: false,
        message,
        statusCode: error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      };
    } finally {
      await session.endSession();
    }
  }
}
