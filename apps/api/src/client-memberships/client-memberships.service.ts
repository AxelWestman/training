import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientMembershipsRepository } from './client-memberships.repository';
import { MembershipsRepository } from '../memberships/memberships.repository';
import { UsersRepository } from '../users/users.repository';
import {
  CreateClientMembershipDto,
  UpdateClientMembershipDto,
} from './dto/client-memberships.dto';

@Injectable()
export class ClientMembershipsService {
  constructor(
    private readonly clientMembershipsRepository: ClientMembershipsRepository,
    private readonly membershipsRepository: MembershipsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findAll() {
    return this.clientMembershipsRepository.findAll();
  }

  async findById(id: number) {
    const clientMembership =
      await this.clientMembershipsRepository.findById(id);
    if (!clientMembership) {
      throw new NotFoundException(`Client membership with id ${id} not found`);
    }
    return clientMembership;
  }

  async findByClientId(clientId: number) {
    const client = await this.usersRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }
    return this.clientMembershipsRepository.findByClientId(clientId);
  }

  async create(dto: CreateClientMembershipDto) {
    const client = await this.usersRepository.findById(dto.client_id);
    if (!client) {
      throw new NotFoundException(`Client with id ${dto.client_id} not found`);
    }

    const membership = await this.membershipsRepository.findById(
      dto.membership_id,
    );
    if (!membership) {
      throw new NotFoundException(
        `Membership with id ${dto.membership_id} not found`,
      );
    }

    const endDate =
      dto.end_date ??
      this.computeEndDate(dto.start_date, membership.duration_days);

    return this.clientMembershipsRepository.create(dto, endDate);
  }

  async update(id: number, dto: UpdateClientMembershipDto) {
    const clientMembership =
      await this.clientMembershipsRepository.findById(id);
    if (!clientMembership) {
      throw new NotFoundException(`Client membership with id ${id} not found`);
    }
    return this.clientMembershipsRepository.updateById(id, dto);
  }

  async delete(id: number) {
    const clientMembership =
      await this.clientMembershipsRepository.findById(id);
    if (!clientMembership) {
      throw new NotFoundException(`Client membership with id ${id} not found`);
    }
    await this.clientMembershipsRepository.deleteById(id);
    return {
      message: `The client membership with id ${id} was deleted`,
    };
  }

  private computeEndDate(startDate: string, durationDays: number): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + durationDays);
    return date.toISOString().split('T')[0];
  }
}
