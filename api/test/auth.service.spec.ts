import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { JwtPayload } from '../src/auth/jwt-payload.interface';
import { User } from '../src/models/user.entity';
import { CreateUserDto } from '../src/user/user.dto';
import { UserService } from '../src/user/user.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user when email and password match', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test',
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      };
      const user = new User();
      user.email = createUserDto.email;
      user.hashPassword = await bcrypt.hash(createUserDto.password, 10);

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      const result = await authService.validateUser(createUserDto);
      expect(result).toEqual(user);
    });

    it('should return null when email does not match', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test',
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      };

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);
      const result = await authService.validateUser(createUserDto);
      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test',
        username: 'testuser',
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user = new User();
      user.email = createUserDto.email;
      user.hashPassword = await bcrypt.hash('testpassword', 10);

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      const result = await authService.validateUser(createUserDto);
      expect(result).toBeNull();
    });
  });

  describe('validate', () => {
    it('should return a user when the payload is valid', async () => {
      const user = new User();
      user.id = 1;
      user.email = 'test@example.com';

      const payload: JwtPayload = { id: user.id, email: user.email };
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);

      const result = await authService.validate(payload);
      expect(result).toEqual(user);
    });

    it('should return null when the payload is invalid', async () => {
      const payload: JwtPayload = { id: 1, email: 'test@example.com' };
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      const result = await authService.validate(payload);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a valid JWT token', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };
      const token = 'valid.token.here';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
      const result = await authService.login(user);
      expect(result.access_token).toEqual(token);
    });
  });
});
