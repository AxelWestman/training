import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { ClientRow } from '../database/database.types';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByDni: jest.fn(),
    activateById: jest.fn(),
    deactivateById: jest.fn(),
    deleteById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  const user = { id: 1, name: 'Juan', lastname: 'Perez' } as ClientRow;

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [user];
      mockRepository.findAll.mockResolvedValue(users);

      await expect(service.findAll()).resolves.toBe(users);
    });
  });

  describe('findById', () => {
    it('should return the user when it exists', async () => {
      mockRepository.findById.mockResolvedValue(user);

      await expect(service.findById(1)).resolves.toBe(user);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('should throw NotFoundException when the user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.activate(1)).rejects.toThrow(NotFoundException);
    });

    it('should activate the user and return a message', async () => {
      mockRepository.findById.mockResolvedValue(user);
      mockRepository.activateById.mockResolvedValue({
        id: 1,
        name: 'Juan',
        lastname: 'Perez',
        is_active: true,
      });

      await expect(service.activate(1)).resolves.toEqual({
        message: 'El usuario Juan Perez ha sido activado.',
      });
    });
  });

  describe('deactivate', () => {
    it('should throw NotFoundException when the user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.deactivate(1)).rejects.toThrow(NotFoundException);
    });

    it('should deactivate the user and return a message', async () => {
      mockRepository.findById.mockResolvedValue(user);
      mockRepository.deactivateById.mockResolvedValue({
        id: 1,
        name: 'Juan',
        lastname: 'Perez',
        is_active: false,
      });

      await expect(service.deactivate(1)).resolves.toEqual({
        message: 'El usuario Juan Perez ha sido desactivado.',
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when the user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete the user and return a message', async () => {
      mockRepository.findById.mockResolvedValue(user);
      mockRepository.deleteById.mockResolvedValue({ id: 1 });

      await expect(service.delete(1)).resolves.toEqual({
        message: 'El usuario Juan Perez con id 1 ha sido eliminado.',
      });
    });
  });

  describe('create', () => {
    const dto = {
      name: 'Juan',
      lastname: 'Perez',
      email: 'juan@example.com',
      password: 'secret123',
      dni: '12345678',
    };

    it('should throw ConflictException when the email already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue({ id: 1, email: dto.email });
      mockRepository.findByDni.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when the dni already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByDni.mockResolvedValue({ id: 1, dni: dto.dni });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should hash the password and create the user', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByDni.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockRepository.create.mockResolvedValue({ id: 1 });
      const originalPassword = dto.password;

      await service.create(dto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(originalPassword, 'salt');
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed',
      });
    });
  });
});
