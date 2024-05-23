import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource, QueryRunner } from 'typeorm';
import {
  CreateContactDto,
  CreateUserDto,
  LoginUserDto,
  UpdateContactDto,
} from './dto/users.dto';
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
      registerData.email =
        registerData.email && registerData.email.toLowerCase();
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

  async createContact(contactData: CreateContactDto, userId: string) {
    try {
      contactData.email = contactData.email && contactData.email.toLowerCase();
      const userData = await this.queryRunner.manager
        .getRepository(Users)
        .create(contactData);
      userData.created_by = userId;
      userData.password = '***';
      const response = await this.queryRunner.manager
        .getRepository(Users)
        .save(userData);
      return {
        status: 'success',
        message: 'Successfully created contacts',
        data: { ...response },
        error: null,
        error_message: null,
      };
    } catch (error) {
      throw new HttpException(error.message, error.code || error.status);
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.queryRunner.manager.getRepository(Users).findOneBy({
      id: userId,
    });
    if (!user || !user.refresh_token)
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refresh_token,
    );
    if (!refreshTokenMatches)
      throw new HttpException('Access Denied', HttpStatus.FORBIDDEN);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      status: 'success',
      message: 'Successfully created access token',
      data: tokens,
      error: null,
      error_message: null,
    };
  }

  async getContacts(tableColumn: any) {
    try {
      const response = await this.queryRunner.manager
        .getRepository(Users)
        .find({ where: { ...tableColumn } });
      return {
        status: 'success',
        message: 'Successfully fetched contacts',
        data: response,
        error: null,
        error_message: null,
      };
    } catch (error) {
      throw new HttpException(error.message, error.code || error.status);
    }
  }

  async updateSpam(contactId: string, updateData: UpdateContactDto) {
    try {
      const response = await this.queryRunner.manager
        .getRepository(Users)
        .createQueryBuilder()
        .update({ ...updateData })
        .where({ id: contactId })
        .returning('*')
        .execute();
      return {
        status: 'success',
        message: 'Successfully updated spam',
        data: response,
        error: null,
        error_message: null,
      };
    } catch (error) {
      throw new HttpException(error.message, error.code || error.status);
    }
  }

  async getSerachedContacts(serachText: string) {
    try {
      const response = await this.queryRunner.manager
        .getRepository(Users)
        .createQueryBuilder()
        .where(serachText ? 'LOWER(name) LIKE LOWER(:query)' : 'true', {
          query: `%${serachText}%`,
        })
        .orWhere(serachText ? 'LOWER(email) LIKE LOWER(:query)' : 'true', {
          query: `%${serachText}%`,
        })
        .getMany();
      return {
        status: 'success',
        message: 'successfully serached products',
        data: response,
        error: null,
        error_message: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.code || error.status);
    }
  }
}
