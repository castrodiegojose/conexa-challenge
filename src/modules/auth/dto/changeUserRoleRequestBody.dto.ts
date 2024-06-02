import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../../../schemas/user.schema';

export class ChangeUserRoleRequestBody {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  role: UserRole;
}
