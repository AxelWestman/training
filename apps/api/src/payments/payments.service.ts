import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { UsersRepository } from '../users/users.repository';
import { ClientMembershipsRepository } from '../client-memberships/client-memberships.repository';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly clientMembershipsRepository: ClientMembershipsRepository,
  ) {}

  async findAll() {
    return this.paymentsRepository.findAll();
  }

  async findById(id: number) {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async findByClientId(clientId: number) {
    const client = await this.usersRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }
    return this.paymentsRepository.findByClientId(clientId);
  }

  async create(dto: CreatePaymentDto) {
    const client = await this.usersRepository.findById(dto.client_id);
    if (!client) {
      throw new NotFoundException(`Client with id ${dto.client_id} not found`);
    }

    if (dto.client_membership_id !== undefined) {
      const clientMembership = await this.clientMembershipsRepository.findById(
        dto.client_membership_id,
      );
      if (!clientMembership) {
        throw new NotFoundException(
          `Client membership with id ${dto.client_membership_id} not found`,
        );
      }
    }

    return this.paymentsRepository.create(dto);
  }

  async update(id: number, dto: UpdatePaymentDto) {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    if (dto.client_membership_id !== undefined) {
      const clientMembership = await this.clientMembershipsRepository.findById(
        dto.client_membership_id,
      );
      if (!clientMembership) {
        throw new NotFoundException(
          `Client membership with id ${dto.client_membership_id} not found`,
        );
      }
    }

    return this.paymentsRepository.updateById(id, dto);
  }

  async delete(id: number) {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    await this.paymentsRepository.deleteById(id);
    return {
      message: `The payment with id ${id} was deleted`,
    };
  }
}
