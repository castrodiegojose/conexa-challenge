import { User } from '../../../schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import TokenObject from '../types/tokenObject.type';

export async function generateTokens(user: User): Promise<TokenObject> {
  const jwtService = new JwtService();
  const [accessToken, refreshToken] = await Promise.all([
    jwtService.signAsync(
      {
        sub: user['_id'],
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '1d',
      },
    ),
    jwtService.signAsync(
      {
        sub: user['_id'],
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    ),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}
