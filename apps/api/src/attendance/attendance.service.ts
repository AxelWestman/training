import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async checkIn(clientId: number) {
    const client = await this.usersRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }

    const existing = await this.attendanceRepository.findTodayCheckIn(clientId);
    if (existing) {
      throw new ConflictException('Client has already checked in today');
    }

    return this.attendanceRepository.create(clientId);
  }

  async findByClientId(clientId: number) {
    const client = await this.usersRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }
    return this.attendanceRepository.findByClientId(clientId);
  }
}
