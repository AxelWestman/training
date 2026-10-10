import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';
import { UsersRepository } from '../users/users.repository';
import { AttendanceRow, ClientRow } from '../database/database.types';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const mockAttendanceRepository = {
    create: jest.fn(),
    findByClientId: jest.fn(),
    findTodayCheckIn: jest.fn(),
  };

  const mockUsersRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: AttendanceRepository,
          useValue: mockAttendanceRepository,
        },
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  const client = { id: 1, name: 'Juan' } as ClientRow;
  const attendance = {
    id: 1,
    client_id: 1,
    check_in: '2026-10-10T12:00:00.000Z',
    check_out: null,
    created_at: '2026-10-10T12:00:00.000Z',
  } as AttendanceRow;

  describe('checkIn', () => {
    it('should throw NotFoundException when the client does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.checkIn(1)).rejects.toThrow(NotFoundException);
      expect(mockAttendanceRepository.findTodayCheckIn).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when already checked in today', async () => {
      mockUsersRepository.findById.mockResolvedValue(client);
      mockAttendanceRepository.findTodayCheckIn.mockResolvedValue(attendance);

      await expect(service.checkIn(1)).rejects.toThrow(ConflictException);
      expect(mockAttendanceRepository.create).not.toHaveBeenCalled();
    });

    it('should create a check-in when none exists today', async () => {
      mockUsersRepository.findById.mockResolvedValue(client);
      mockAttendanceRepository.findTodayCheckIn.mockResolvedValue(null);
      mockAttendanceRepository.create.mockResolvedValue(attendance);

      await expect(service.checkIn(1)).resolves.toBe(attendance);
      expect(mockAttendanceRepository.create).toHaveBeenCalledWith(1);
    });
  });

  describe('findByClientId', () => {
    it('should throw NotFoundException when the client does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.findByClientId(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAttendanceRepository.findByClientId).not.toHaveBeenCalled();
    });

    it('should return the attendance history', async () => {
      const list = [attendance];
      mockUsersRepository.findById.mockResolvedValue(client);
      mockAttendanceRepository.findByClientId.mockResolvedValue(list);

      await expect(service.findByClientId(1)).resolves.toBe(list);
      expect(mockAttendanceRepository.findByClientId).toHaveBeenCalledWith(1);
    });
  });
});
