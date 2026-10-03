import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminsService } from './admins.service';
import { AdminsRepository } from './admins.repository';
import { AdminRow } from '../database/database.types';

jest.mock('bcrypt');

describe('AdminsService', () => {
  let service: AdminsService;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByDni: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsService,
        { provide: AdminsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AdminsService>(AdminsService);
  });

  const admin = {
    id: 1,
    name: 'Ana',
    lastname: 'Lopez',
    email: 'ana@example.com',
    dni: '12345678',
    role: 'admin',
  } as AdminRow;

  describe('findAll', () => {
    it('should return all admins', async () => {
      const admins = [admin];
      mockRepository.findAll.mockResolvedValue(admins);

      await expect(service.findAll()).resolves.toBe(admins);
    });
  });

  describe('findById', () => {
    it('should return the admin when it exists', async () => {
      mockRepository.findById.mockResolvedValue(admin);

      await expect(service.findById(1)).resolves.toBe(admin);
    });

    it('should throw NotFoundException when the admin does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = {
      name: 'Ana',
      lastname: 'Lopez',
      email: 'ana@example.com',
      password: 'secret123',
      role: 'admin' as const,
      dni: '12345678',
    };

    it('should throw ConflictException when the email already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue({ id: 1, email: dto.email });
      mockRepository.findByDni.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when the dni already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByDni.mockResolvedValue({ id: 1 });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should hash the password and create the admin', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByDni.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockRepository.create.mockResolvedValue(admin);
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

  describe('update', () => {
    const dto = { name: 'Ana Maria' };

    it('should throw NotFoundException when the admin does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when the new email belongs to another admin', async () => {
      mockRepository.findById.mockResolvedValue(admin);
      mockRepository.findByEmail.mockResolvedValue({
        id: 2,
        email: 'taken@example.com',
      });

      await expect(
        service.update(1, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow keeping the same email', async () => {
      mockRepository.findById.mockResolvedValue(admin);
      mockRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: admin.email,
      });
      mockRepository.updateById.mockResolvedValue(admin);

      await expect(service.update(1, { email: admin.email })).resolves.toBe(
        admin,
      );
      expect(mockRepository.updateById).toHaveBeenCalledWith(1, {
        email: admin.email,
      });
    });

    it('should hash the password when it is provided', async () => {
      mockRepository.findById.mockResolvedValue(admin);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockRepository.updateById.mockResolvedValue(admin);

      await service.update(1, { password: 'newpass' });

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 'salt');
      expect(mockRepository.updateById).toHaveBeenCalledWith(1, {
        password: 'hashed',
      });
    });

    it('should not hash anything when no password is provided', async () => {
      mockRepository.findById.mockResolvedValue(admin);
      mockRepository.updateById.mockResolvedValue(admin);

      await service.update(1, { name: 'Ana Maria' });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockRepository.updateById).toHaveBeenCalledWith(1, {
        name: 'Ana Maria',
      });
    });
  });

  describe('delete', () => {
    it('should throw ForbiddenException when deleting yourself', async () => {
      await expect(service.delete(1, 1)).rejects.toThrow(ForbiddenException);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the admin does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(2, 1)).rejects.toThrow(NotFoundException);
    });

    it('should delete the admin', async () => {
      mockRepository.findById.mockResolvedValue(admin);
      mockRepository.deleteById.mockResolvedValue({ id: 2 });

      await expect(service.delete(2, 1)).resolves.toEqual({ id: 2 });
      expect(mockRepository.deleteById).toHaveBeenCalledWith(2);
    });
  });
});
