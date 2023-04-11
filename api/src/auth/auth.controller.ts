import {
  Body,
  ConflictException,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOkResponse({ description: 'User successfully authenticated.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiBadRequestResponse({ description: 'Invalid parameters.' })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(loginUserDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }

  @ApiCreatedResponse({ description: 'User successfully registered.' })
  @ApiConflictResponse({ description: 'Email already registered.' })
  @ApiBadRequestResponse({ description: 'Invalid parameters.' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<any> {
    const userExists = await this.userService.findOneByEmail(
      createUserDto.email,
    );

    if (userExists) {
      throw new ConflictException('Email already registered');
    }

    const newUser = await this.userService.create(createUserDto);
    return { message: 'User successfully registered', user: newUser };
  }
}
