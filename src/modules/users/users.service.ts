import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import { Users } from 'src/common/entities';


@Injectable()
export class UsersService {
  private queryRunner: QueryRunner = this.dataSource.createQueryRunner();
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async hashData(data: string) {
    return await bcrypt.hash(data, 12);
  }
  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshTokn = await this.hashData(refreshToken);
    await this.queryRunner.manager
      .getRepository(Users)
      .createQueryBuilder()
      .update({ refresh_token: hashedRefreshTokn })
      .where({ id: userId })
      .execute();
  }

  async register(registerData: CreateUserDto) {
    try {
      registerData.password = await this.hashData(registerData.password);
      registerData.email = registerData.email.toLowerCase();
      const userData = await this.queryRunner.manager
        .getRepository(Users)
        .create(registerData);
      const response = await this.queryRunner.manager
        .getRepository(Users)
        .save(userData);
      const token = await this.getTokens(response.id, response.email);
      await this.updateRefreshToken(response.id, token.refreshToken);
      return {
        status: 'success',
        message: 'Successfully registered Users',
        data: { ...response, ...token },
        error: null,
        error_message: null,
      };
    } catch (error) {
      throw new HttpException(error.message, error.code || error.status);
    }
  }

  async login(loginData: LoginUserDto) {
    try {
      const userData = await this.queryRunner.manager
        .getRepository(Users)
        .findOneBy({
          phone_number: loginData.phone_number,
          active: true,
        });
      if (!userData)
        throw new HttpException(
          'Account not found, please register',
          HttpStatus.BAD_REQUEST,
        );
      if (!(await bcrypt.compare(loginData.password, userData.password)))
        throw new HttpException(
          'Password not matching',
          HttpStatus.BAD_REQUEST,
        );

      const tokens = await this.getTokens(userData.id, userData.email);
      await this.updateRefreshToken(userData.id, tokens.refreshToken);
      return {
        status: 'success',
        message: 'Successfully login Users',
        data: {
          ...userData,
          ...tokens,
        },
        error: null,
        error_message: null,
      };
    } catch (error) {
      throw new HttpException(error.message, error.code || error.status);
    }
  }

  async logout(userId: string) {
    try {
      const response = await this.queryRunner.manager
        .getRepository(Users)
        .createQueryBuilder()
        .update({ refresh_token: '' })
        .where({ id: userId })
        .returning('*')
        .execute();

      return {
        status: 'success',
        message: 'Successfully logout Users',
        data: response.raw[0],
        error: null,
        error_message: null,
      };
    } catch (error) {
      throw new HttpException(error.message, error.code || error.status);
    }
  }
}
