import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../src/models/user.entity';
import { UserController } from '../src/user/user.controller';
import { CreateUserDto, UpdateUserDto } from '../src/user/user.dto';
import { UserService } from '../src/user/user.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        {
          id: 1,
          name: 'John',
          username: 'Doe',
          email: 'user@example.com',
          hashPassword: 'hashed_password',
          dataCriacao: new Date(),
          dataUpdate: new Date(),
          ativo: true,
          perfil: ['user'],
        },
        {
          id: 2,
          name: 'Jane',
          username: 'Doe',
          email: 'jane@example.com',
          hashPassword: 'hashed_password',
          dataCriacao: new Date(),
          dataUpdate: new Date(),
          ativo: true,
          perfil: ['admin'],
        },
      ];

      jest.spyOn(userService, 'findAll').mockResolvedValue(users);
      expect(await userController.findAll()).toBe(users);
    });

    it('should throw an error if finding all users fails', async () => {
      jest
        .spyOn(userService, 'findAll')
        .mockRejectedValue(new Error('Error finding users'));
      await expect(userController.findAll()).rejects.toThrow(
        'Error finding users',
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user: User = {
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

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      expect(await userController.findOne(1)).toBe(user);
    });

    it('should throw an error if finding user by ID fails', async () => {
      jest
        .spyOn(userService, 'findOne')
        .mockRejectedValue(new Error('Error finding user by ID'));
      await expect(userController.findOne(1)).rejects.toThrow(
        'Error finding user by ID',
      );
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        username: 'Doe',
        email: 'user@example.com',
        password: 'password',
      };

      const user: User = {
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

      jest.spyOn(userService, 'create').mockResolvedValue(user);
      expect(await userController.create(createUserDto)).toBe(user);
    });

    it('should throw an error if creating user fails', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        username: 'Doe',
        email: 'user@example.com',
        password: 'password',
      };

      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new Error('Error creating user'));
      await expect(userController.create(createUserDto)).rejects.toThrow(
        'Error creating user',
      );
    });
  });

  describe('update', () => {
    it('should update and return a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Updated',
        username: 'Doe Updated',
      };
      const user: User = {
        id: 1,
        name: 'John Updated',
        username: 'Doe Updated',
        email: 'user@example.com',
        hashPassword: 'hashed_password',
        dataCriacao: new Date(),
        dataUpdate: new Date(),
        ativo: true,
        perfil: ['user'],
      };

      jest.spyOn(userService, 'update').mockResolvedValue(user);
      expect(await userController.update(1, updateUserDto)).toBe(user);
    });

    it('should throw an error if updating user fails', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'John Updated',
        username: 'Doe Updated',
      };

      jest
        .spyOn(userService, 'update')
        .mockRejectedValue(new Error('Error updating user'));
      await expect(userController.update(1, updateUserDto)).rejects.toThrow(
        'Error updating user',
      );
    });
  });

  describe('delete', () => {
    it('should delete a user by ID', async () => {
      jest.spyOn(userService, 'delete').mockResolvedValue(undefined);
      await expect(userController.delete(1)).resolves.toBeUndefined();
    });
    it('should throw an error if deleting user fails', async () => {
      jest
        .spyOn(userService, 'delete')
        .mockRejectedValue(new Error('Error deleting user'));
      await expect(userController.delete(1)).rejects.toThrow(
        'Error deleting user',
      );
    });
  });
});
