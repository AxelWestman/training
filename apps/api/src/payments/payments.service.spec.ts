import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { UsersRepository } from '../users/users.repository';
import { ClientMembershipsRepository } from '../client-memberships/client-memberships.repository';
import { ClientRow, PaymentView } from '../database/database.types';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByClientId: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockUsersRepository = {
    findById: jest.fn(),
  };

  const mockClientMembershipsRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: mockRepository },
        { provide: UsersRepository, useValue: mockUsersRepository },
        {
          provide: ClientMembershipsRepository,
          useValue: mockClientMembershipsRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  const client = { id: 1, name: 'Juan' } as ClientRow;
  const payment = { id: 1, client_id: 1 } as PaymentView;

  describe('findAll', () => {
    it('should return all payments', async () => {
      const payments = [payment];
      mockRepository.findAll.mockResolvedValue(payments);

      await expect(service.findAll()).resolves.toBe(payments);
    });
  });

  describe('findById', () => {
    it('should return the payment when it exists', async () => {
      mockRepository.findById.mockResolvedValue(payment);

      await expect(service.findById(1)).resolves.toBe(payment);
    });

    it('should throw NotFoundException when the payment does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByClientId', () => {
    it('should throw NotFoundException when the client does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.findByClientId(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the payments of the client', async () => {
      const payments = [payment];
      mockUsersRepository.findById.mockResolvedValue(client);
      mockRepository.findByClientId.mockResolvedValue(payments);

      await expect(service.findByClientId(1)).resolves.toBe(payments);
      expect(mockRepository.findByClientId).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    const dto = {
      client_id: 1,
      amount: 15000,
      payment_date: '2026-09-01',
      due_date: '2026-09-01',
      method: 'cash',
    };

    it('should throw NotFoundException when the client does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the client membership does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(client);
      mockClientMembershipsRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({ ...dto, client_membership_id: 99 }),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create the payment without checking a membership', async () => {
      mockUsersRepository.findById.mockResolvedValue(client);
      mockRepository.create.mockResolvedValue(payment);

      await expect(service.create(dto)).resolves.toBe(payment);
      expect(mockClientMembershipsRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should create the payment when the membership exists', async () => {
      const dtoWithMembership = { ...dto, client_membership_id: 5 };
      mockUsersRepository.findById.mockResolvedValue(client);
      mockClientMembershipsRepository.findById.mockResolvedValue({ id: 5 });
      mockRepository.create.mockResolvedValue(payment);

      await expect(service.create(dtoWithMembership)).resolves.toBe(payment);
      expect(mockClientMembershipsRepository.findById).toHaveBeenCalledWith(5);
      expect(mockRepository.create).toHaveBeenCalledWith(dtoWithMembership);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when the payment does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, { amount: 20000 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the client membership does not exist', async () => {
      mockRepository.findById.mockResolvedValue(payment);
      mockClientMembershipsRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(1, { client_membership_id: 99 }),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.updateById).not.toHaveBeenCalled();
    });

    it('should update the payment', async () => {
      mockRepository.findById.mockResolvedValue(payment);
      mockRepository.updateById.mockResolvedValue({
        ...payment,
        amount: '20000',
      });

      await expect(service.update(1, { amount: 20000 })).resolves.toEqual({
        ...payment,
        amount: '20000',
      });
      expect(mockRepository.updateById).toHaveBeenCalledWith(1, {
        amount: 20000,
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when the payment does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete the payment and return a message', async () => {
      mockRepository.findById.mockResolvedValue(payment);
      mockRepository.deleteById.mockResolvedValue({ id: 1 });

      await expect(service.delete(1)).resolves.toEqual({
        message: 'The payment with id 1 was deleted',
      });
      expect(mockRepository.deleteById).toHaveBeenCalledWith(1);
    });
  });
});
