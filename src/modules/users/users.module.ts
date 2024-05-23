import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from 'src/common/auth/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from 'src/common/auth/strategies/refreshToken.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class UsersModule {}
