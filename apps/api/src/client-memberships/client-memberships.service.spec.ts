import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientMembershipsService } from './client-memberships.service';
import { ClientMembershipsRepository } from './client-memberships.repository';
import { MembershipsRepository } from '../memberships/memberships.repository';
import { UsersRepository } from '../users/users.repository';
import {
  ClientMembershipView,
  ClientRow,
  MembershipRow,
} from '../database/database.types';

describe('ClientMembershipsService', () => {
  let service: ClientMembershipsService;

  const mockClientMembershipsRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByClientId: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockMembershipsRepository = {
    findById: jest.fn(),
  };

  const mockUsersRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientMembershipsService,
        {
          provide: ClientMembershipsRepository,
          useValue: mockClientMembershipsRepository,
        },
        {
          provide: MembershipsRepository,
          useValue: mockMembershipsRepository,
        },
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<ClientMembershipsService>(ClientMembershipsService);
  });

  const client = { id: 1, name: 'Juan' } as ClientRow;
  const membership = {
    id: 1,
    name: 'Mensual',
    duration_days: 30,
  } as MembershipRow;
  const clientMembership = { id: 1, client_id: 1 } as ClientMembershipView;

  describe('findAll', () => {
    it('should return all client memberships', async () => {
      const list = [clientMembership];
      mockClientMembershipsRepository.findAll.mockResolvedValue(list);

      await expect(service.findAll()).resolves.toBe(list);
    });
  });

  describe('findById', () => {
    it('should return the client membership when it exists', async () => {
      mockClientMembershipsRepository.findById.mockResolvedValue(
        clientMembership,
      );

      await expect(service.findById(1)).resolves.toBe(clientMembership);
    });

    it('should throw NotFoundException when it does not exist', async () => {
      mockClientMembershipsRepository.findById.mockResolvedValue(null);

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

    it('should return the memberships of the client', async () => {
      const list = [clientMembership];
      mockUsersRepository.findById.mockResolvedValue(client);
      mockClientMembershipsRepository.findByClientId.mockResolvedValue(list);

      await expect(service.findByClientId(1)).resolves.toBe(list);
      expect(
        mockClientMembershipsRepository.findByClientId,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    const dto = {
      client_id: 1,
      membership_id: 1,
      start_date: '2026-06-01',
    };

    it('should throw NotFoundException when the client does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(mockMembershipsRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the membership does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(client);
      mockMembershipsRepository.findById.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(mockClientMembershipsRepository.create).not.toHaveBeenCalled();
    });

    it('should compute the end date from the membership duration', async () => {
      mockUsersRepository.findById.mockResolvedValue(client);
      mockMembershipsRepository.findById.mockResolvedValue(membership);
      mockClientMembershipsRepository.create.mockResolvedValue(
        clientMembership,
      );

      await expect(service.create(dto)).resolves.toBe(clientMembership);
      expect(mockClientMembershipsRepository.create).toHaveBeenCalledWith(
        dto,
        '2026-07-01',
      );
    });

    it('should use the provided end date without computing it', async () => {
      const dtoWithEnd = { ...dto, end_date: '2026-06-15' };
      mockUsersRepository.findById.mockResolvedValue(client);
      mockMembershipsRepository.findById.mockResolvedValue(membership);
      mockClientMembershipsRepository.create.mockResolvedValue(
        clientMembership,
      );

      await expect(service.create(dtoWithEnd)).resolves.toBe(clientMembership);
      expect(mockClientMembershipsRepository.create).toHaveBeenCalledWith(
        dtoWithEnd,
        '2026-06-15',
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when it does not exist', async () => {
      mockClientMembershipsRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, { status: 'cancelled' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update the client membership', async () => {
      mockClientMembershipsRepository.findById.mockResolvedValue(
        clientMembership,
      );
      mockClientMembershipsRepository.updateById.mockResolvedValue({
        ...clientMembership,
        status: 'cancelled',
      });

      await expect(service.update(1, { status: 'cancelled' })).resolves.toEqual(
        { ...clientMembership, status: 'cancelled' },
      );
      expect(mockClientMembershipsRepository.updateById).toHaveBeenCalledWith(
        1,
        { status: 'cancelled' },
      );
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when it does not exist', async () => {
      mockClientMembershipsRepository.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete the client membership and return a message', async () => {
      mockClientMembershipsRepository.findById.mockResolvedValue(
        clientMembership,
      );
      mockClientMembershipsRepository.deleteById.mockResolvedValue({ id: 1 });

      await expect(service.delete(1)).resolves.toEqual({
        message: 'The client membership with id 1 was deleted',
      });
      expect(mockClientMembershipsRepository.deleteById).toHaveBeenCalledWith(
        1,
      );
    });
  });
});
