import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClientRoutinesService } from './client-routines.service';
import { ClientRoutinesRepository } from './client-routines.repository';
import { UsersRepository } from '../users/users.repository';
import { RoutinesRepository } from '../routines/routines.repository';
import {
  ClientRoutineView,
  ClientRow,
  JwtUser,
  RoutineRow,
} from '../database/database.types';

describe('ClientRoutinesService', () => {
  let service: ClientRoutinesService;

  const mockClientRoutinesRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByClientId: jest.fn(),
    findByRoutineId: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockUsersRepository = {
    findById: jest.fn(),
  };

  const mockRoutinesRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientRoutinesService,
        {
          provide: ClientRoutinesRepository,
          useValue: mockClientRoutinesRepository,
        },
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: RoutinesRepository, useValue: mockRoutinesRepository },
      ],
    }).compile();

    service = module.get<ClientRoutinesService>(ClientRoutinesService);
  });

  const client = { id: 1, name: 'Juan' } as ClientRow;
  const routine = { id: 1, name: 'Full Body' } as RoutineRow;
  const clientRoutine = {
    id: 1,
    client_id: 1,
    routine_id: 1,
  } as ClientRoutineView;
  const adminUser: JwtUser = {
    sub: 99,
    email: 'admin@example.com',
    type: 'admin',
    role: 'admin',
  };

  describe('findAll', () => {
    it('should return all client routines', async () => {
      const list = [clientRoutine];
      mockClientRoutinesRepository.findAll.mockResolvedValue(list);

      await expect(service.findAll()).resolves.toBe(list);
    });
  });

  describe('findById', () => {
    it('should return the client routine when it exists', async () => {
      mockClientRoutinesRepository.findById.mockResolvedValue(clientRoutine);

      await expect(service.findById(1)).resolves.toBe(clientRoutine);
    });

    it('should throw NotFoundException when it does not exist', async () => {
      mockClientRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByClientId', () => {
    it('should throw ForbiddenException when a client requests another client', async () => {
      const clientUser: JwtUser = {
        sub: 2,
        email: 'client@example.com',
        type: 'client',
        role: 'client',
      };

      await expect(service.findByClientId(1, clientUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockUsersRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the client does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.findByClientId(1, adminUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the routines of the client', async () => {
      const list = [clientRoutine];
      mockUsersRepository.findById.mockResolvedValue(client);
      mockClientRoutinesRepository.findByClientId.mockResolvedValue(list);

      await expect(service.findByClientId(1, adminUser)).resolves.toBe(list);
    });

    it('should allow a client to view their own routines', async () => {
      const clientUser: JwtUser = {
        sub: 1,
        email: 'client@example.com',
        type: 'client',
        role: 'client',
      };
      mockUsersRepository.findById.mockResolvedValue(client);
      mockClientRoutinesRepository.findByClientId.mockResolvedValue([]);

      await expect(service.findByClientId(1, clientUser)).resolves.toEqual([]);
    });
  });

  describe('findByRoutineId', () => {
    it('should throw NotFoundException when the routine does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.findByRoutineId(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the client routines of the routine', async () => {
      const list = [clientRoutine];
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockClientRoutinesRepository.findByRoutineId.mockResolvedValue(list);

      await expect(service.findByRoutineId(1)).resolves.toBe(list);
    });
  });

  describe('create', () => {
    const dto = { client_id: 1, routine_id: 1, start_date: '2026-09-01' };

    it('should throw NotFoundException when the client does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.create(dto, 99)).rejects.toThrow(NotFoundException);
      expect(mockRoutinesRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the routine does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(client);
      mockRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.create(dto, 99)).rejects.toThrow(NotFoundException);
      expect(mockClientRoutinesRepository.create).not.toHaveBeenCalled();
    });

    it('should assign the routine to the client', async () => {
      mockUsersRepository.findById.mockResolvedValue(client);
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockClientRoutinesRepository.create.mockResolvedValue(clientRoutine);

      await expect(service.create(dto, 99)).resolves.toBe(clientRoutine);
      expect(mockClientRoutinesRepository.create).toHaveBeenCalledWith(dto, 99);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when it does not exist', async () => {
      mockClientRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, { is_active: false })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update the client routine', async () => {
      mockClientRoutinesRepository.findById.mockResolvedValue(clientRoutine);
      mockClientRoutinesRepository.updateById.mockResolvedValue({
        ...clientRoutine,
        is_active: false,
      });

      await expect(service.update(1, { is_active: false })).resolves.toEqual({
        ...clientRoutine,
        is_active: false,
      });
      expect(mockClientRoutinesRepository.updateById).toHaveBeenCalledWith(1, {
        is_active: false,
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when it does not exist', async () => {
      mockClientRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete the client routine and return a message', async () => {
      mockClientRoutinesRepository.findById.mockResolvedValue(clientRoutine);
      mockClientRoutinesRepository.deleteById.mockResolvedValue({ id: 1 });

      await expect(service.delete(1)).resolves.toEqual({
        message: 'The client routine with id 1 was deleted',
      });
      expect(mockClientRoutinesRepository.deleteById).toHaveBeenCalledWith(1);
    });
  });
});
