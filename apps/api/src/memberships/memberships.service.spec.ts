import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsRepository } from './memberships.repository';
import { MembershipRow } from '../database/database.types';

describe('MembershipsService', () => {
  let service: MembershipsService;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipsService,
        { provide: MembershipsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<MembershipsService>(MembershipsService);
  });

  const membership = {
    id: 1,
    name: 'Mensual',
    duration_days: 30,
  } as MembershipRow;

  describe('findAll', () => {
    it('should return all memberships', async () => {
      const memberships = [membership];
      mockRepository.findAll.mockResolvedValue(memberships);

      await expect(service.findAll()).resolves.toBe(memberships);
    });
  });

  describe('findById', () => {
    it('should return the membership when it exists', async () => {
      mockRepository.findById.mockResolvedValue(membership);

      await expect(service.findById(1)).resolves.toBe(membership);
    });

    it('should throw NotFoundException when the membership does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create the membership', async () => {
      const dto = { name: 'Anual', duration_days: 365, price: 150000 };
      mockRepository.create.mockResolvedValue({ id: 2, ...dto });

      await expect(service.create(dto)).resolves.toEqual({ id: 2, ...dto });
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when the membership does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, { price: 20000 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update the membership', async () => {
      mockRepository.findById.mockResolvedValue(membership);
      mockRepository.updateById.mockResolvedValue({
        ...membership,
        price: '20000',
      });

      await expect(service.update(1, { price: 20000 })).resolves.toEqual({
        ...membership,
        price: '20000',
      });
      expect(mockRepository.updateById).toHaveBeenCalledWith(1, {
        price: 20000,
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when the membership does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete the membership and return a message', async () => {
      mockRepository.findById.mockResolvedValue(membership);
      mockRepository.deleteById.mockResolvedValue({ id: 1, name: 'Mensual' });

      await expect(service.delete(1)).resolves.toEqual({
        message: 'The membership Mensual was deleted',
      });
      expect(mockRepository.deleteById).toHaveBeenCalledWith(1);
    });
  });
});
