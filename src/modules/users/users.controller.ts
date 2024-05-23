import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiVersions } from 'src/common/utils/version_list';
import {
  CreateContactDto,
  CreateUserDto,
  LoginUserDto,
  UpdateContactDto,
} from 'src/modules/users/dto/users.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { GetToken } from 'src/common/decorator';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  // Register a user
  @Version(ApiVersions.V_0_0_1)
  @Post('register')
  async registerUser(@Body() register: CreateUserDto) {
    return this.userService.register(register);
  }

  //Login a user
  @Version(ApiVersions.V_0_0_1)
  @Post('login')
  async loginUser(@Body() loginData: LoginUserDto) {
    return this.userService.login(loginData);
  }

  //logout a user ( removing refresh_token from db)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('logout')
  logout(@GetToken('sub') userId: string) {
    return this.userService.logout(userId);
  }

  // Gen access token by passing refresh token . once accesstoken exprires we can use this routes
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refresh(
    @GetToken('sub') userId: string,
    @GetToken('refreshToken') refreshToken: string,
  ) {
    return this.userService.refreshTokens(userId, refreshToken);
  }

  // Create contacts
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('contacts')
  createContacts(
    @GetToken('sub') userId: string,
    @Body() contactData: CreateContactDto,
  ) {
    return this.userService.createContact(contactData, userId);
  }

  //Get contacts by filter

  @ApiQuery({ name: 'is_spam' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('contacts')
  getContacts(@Query() tableColumn: any) {
    return this.userService.getContacts(tableColumn);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Patch('contacts/:id')
  updateSpam(
    @Param('id') contactId: string,
    @Body() updateData: UpdateContactDto,
  ) {
    return this.userService.updateSpam(contactId, updateData);
  }

  @ApiQuery({ name: 'search_text' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('contacts/search')
  getSearchedContacts(@Query('search_text') searchText: string) {
    return this.userService.getSerachedContacts(searchText);
  }
}
