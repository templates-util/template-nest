import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../src/models/user.entity';
import { CreateUserDto, UpdateUserDto } from '../src/user/user.dto';
import { UserService } from '../src/user/user.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        {
          id: 1,
          name: 'User 1',
          username: 'user1',
          email: 'user1@example.com',
          hashPassword: 'hashedpassword1',
          dataCriacao: new Date(),
          dataUpdate: new Date(),
          ativo: true,
          perfil: ['user'],
        },
        {
          id: 2,
          name: 'User 2',
          username: 'user2',
          email: 'user2@example.com',
          hashPassword: 'hashedpassword2',
          dataCriacao: new Date(),
          dataUpdate: new Date(),
          ativo: true,
          perfil: ['user'],
        },
      ];
      jest.spyOn(userRepository, 'find').mockResolvedValue(users);
      const result = await userService.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user with a given id', async () => {
      const user: User = {
        id: 1,
        name: 'User 1',
        username: 'user1',
        email: 'user1@example.com',
        hashPassword: 'hashedpassword1',
        dataCriacao: new Date(),
        dataUpdate: new Date(),
        ativo: true,
        perfil: ['user'],
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await userService.findOne(1);
      expect(result).toEqual(user);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
      };
      const newUser: User = {
        id: 1,
        ...createUserDto,
        hashPassword: 'hashedtestpassword',
        dataCriacao: new Date(),
        dataUpdate: new Date(),
        ativo: true,
        perfil: ['user'],
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

      const result = await userService.create(createUserDto);
      expect(result).toEqual(newUser);
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
        username: 'updateduser',
        email: 'updated@example.com',
        password: 'updatedpassword',
        ativo: false,
        perfil: ['admin'],
      };
      const updatedUser: Partial<User> = {
        id: 1,
        ...updateUserDto,
        hashPassword: 'hashedupdatedpassword',
        dataCriacao: new Date(),
        dataUpdate: new Date(),
      };

      const updateResult: UpdateResult = {
        raw: {},
        affected: 1,
        generatedMaps: [],
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(updatedUser as User);
      jest.spyOn(userRepository, 'update').mockResolvedValue(updateResult);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(updatedUser as User);

      const result = await userService.update(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('should delete a user with a given id', async () => {
      const userToDelete: Partial<User> = {
        id: 1,
        name: 'User To Delete',
        username: 'usertodelete',
        email: 'user1@example.com',
        hashPassword: 'hashedpassword',
        dataCriacao: new Date(),
        dataUpdate: new Date(),
        ativo: true,
        perfil: ['user'],
      };

      jest
        .spyOn(userService, 'findOne')
        .mockResolvedValue(userToDelete as User);
      jest
        .spyOn(userRepository, 'delete')
        .mockResolvedValue({ affected: 1, raw: [] });

      await userService.delete(1);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user with a given email', async () => {
      const user: User = {
        id: 1,
        name: 'User 1',
        username: 'user1',
        email: 'user1@example.com',
        hashPassword: 'hashedpassword1',
        dataCriacao: new Date(),
        dataUpdate: new Date(),
        ativo: true,
        perfil: ['user'],
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await userService.findOneByEmail('user1@example.com');
      expect(result).toEqual(user);
    });
  });
});
