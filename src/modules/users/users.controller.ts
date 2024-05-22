import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiVersions } from 'src/common/utils/version_list';
import { CreateUserDto, LoginUserDto } from 'src/modules/users/dto/users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Version(ApiVersions.V_0_0_1)
  @Post('register')
  async registerUser(@Body() register: CreateUserDto) {
    return this.userService.register(register);
  }

  @Version(ApiVersions.V_0_0_1)
  @Post('login')
  async loginUser(@Body() loginData: LoginUserDto) {
    return this.userService.login(loginData);
  }
}
