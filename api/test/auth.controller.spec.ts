import { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as supertest from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/models/user.entity';
import { UserService } from '../src/user/user.service';
dotenv.config();

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;
  let authController: AuthController;
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: (process.env.TYPEORM_CONNECTION as any) || 'postgres',
          host: process.env.TYPEORM_HOST,
          port: 5432,
          username: process.env.TYPEORM_USERNAME,
          password: process.env.TYPEORM_PASSWORD,
          database: process.env.TYPEORM_DATABASE,
          synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
          logging: process.env.TYPEORM_LOGGING === 'true',
          entities: [User],
        }),
        TypeOrmModule.forFeature([User]), // Import TypeOrmModule with User entity
        JwtModule.register({
          // Import JwtModule with your configuration
          secret: 'your-secret-key', // Replace this with your actual secret key
          signOptions: { expiresIn: '1h' }, // Adjust the options according to your needs
        }),
      ],
      controllers: [AuthController],
      providers: [UserService, AuthService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    request = supertest(app.getHttpServer());

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('/POST /auth/login', () => {
    it('should return JWT token on valid user', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John',
        username: 'Doe',
        email: 'user@example.com',
        hashPassword: 'hashed_password',
        dataCriacao: new Date(),
        dataUpdate: new Date(),
        ativo: true,
        perfil: ['user'],
      };
      const mockToken = 'test_token';

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ access_token: mockToken, user: mockUser });

      const response = await request
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password' })
        .expect(201);

      expect(response.body.access_token).toEqual(mockToken);
    });

    it('should return 401 on invalid user', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await request
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'wrong_password' })
        .expect(401);
    });
  });
});
