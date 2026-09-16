import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ClientRoutinesRepository } from './client-routines.repository';
import { UsersRepository } from '../users/users.repository';
import { RoutinesRepository } from '../routines/routines.repository';
import { JwtUser } from '../database/database.types';
import {
  CreateClientRoutineDto,
  UpdateClientRoutineDto,
} from './dto/client-routines.dto';

@Injectable()
export class ClientRoutinesService {
  constructor(
    private readonly clientRoutinesRepository: ClientRoutinesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly routinesRepository: RoutinesRepository,
  ) {}

  async findAll() {
    return this.clientRoutinesRepository.findAll();
  }

  async findById(id: number) {
    const clientRoutine = await this.clientRoutinesRepository.findById(id);
    if (!clientRoutine) {
      throw new NotFoundException(`Client routine with id ${id} not found`);
    }
    return clientRoutine;
  }

  async findByClientId(clientId: number, requestingUser: JwtUser) {
    if (requestingUser.type === 'client' && requestingUser.sub !== clientId) {
      throw new ForbiddenException('Clients can only view their own routines');
    }

    const client = await this.usersRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }
    return this.clientRoutinesRepository.findByClientId(clientId);
  }

  async findByRoutineId(routineId: number) {
    const routine = await this.routinesRepository.findById(routineId);
    if (!routine) {
      throw new NotFoundException(`Routine with id ${routineId} not found`);
    }
    return this.clientRoutinesRepository.findByRoutineId(routineId);
  }

  async create(dto: CreateClientRoutineDto, assignedBy: number) {
    const client = await this.usersRepository.findById(dto.client_id);
    if (!client) {
      throw new NotFoundException(`Client with id ${dto.client_id} not found`);
    }

    const routine = await this.routinesRepository.findById(dto.routine_id);
    if (!routine) {
      throw new NotFoundException(
        `Routine with id ${dto.routine_id} not found`,
      );
    }

    return this.clientRoutinesRepository.create(dto, assignedBy);
  }

  async update(id: number, dto: UpdateClientRoutineDto) {
    const clientRoutine = await this.clientRoutinesRepository.findById(id);
    if (!clientRoutine) {
      throw new NotFoundException(`Client routine with id ${id} not found`);
    }
    return this.clientRoutinesRepository.updateById(id, dto);
  }

  async delete(id: number) {
    const clientRoutine = await this.clientRoutinesRepository.findById(id);
    if (!clientRoutine) {
      throw new NotFoundException(`Client routine with id ${id} not found`);
    }
    await this.clientRoutinesRepository.deleteById(id);
    return {
      message: `The client routine with id ${id} was deleted`,
    };
  }
}
