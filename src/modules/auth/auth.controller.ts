import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import ClientResponse from '../../common/interfaces/clientResponse.interface';
import SignUpInResponse from './types/signUpResponse.type';
import { SignUpRequestBody } from './dto/signUpRequestBody.dto';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from '../../common/guard/accessToken.guard';
import { ChangeUserRoleRequestBody } from './dto/changeUserRoleRequestBody.dto';
import ChangeUserRoleResponse from './types/changeUserRoleResponse.type';
import { SignInRequestBody } from './dto/signInRequestBody.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/sign-up')
  async signUp(
    @Res() res: Response<ClientResponse<SignUpInResponse>>,
    @Body() newUser: SignUpRequestBody,
  ) {
    const results = await this.authService.signUp(newUser);
    return res.status(results.statusCode).json(results);
  }

  @Post('/sign-in')
  async signIn(
    @Res() res: Response<ClientResponse<SignUpInResponse>>,
    @Body() newUser: SignInRequestBody,
  ) {
    const results = await this.authService.signIn(newUser);
    return res.status(results.statusCode).json(results);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('/change-user-role')
  async changeUserRole(
    @Req() req: Request,
    @Res() res: Response<ClientResponse<ChangeUserRoleResponse>>,
    @Body() userRole: ChangeUserRoleRequestBody,
  ) {
    const userId = req.user['sub'];

    const results = await this.authService.changeUserRole(userId, userRole);
    return res.status(results.statusCode).json(results);
  }
}
