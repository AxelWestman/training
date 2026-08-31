import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipsRepository } from './memberships.repository';
import {
  CreateMembershipDto,
  UpdateMembershipDto,
} from './dto/memberships.dto';

@Injectable()
export class MembershipsService {
  constructor(private readonly membershipsRepository: MembershipsRepository) {}

  async findAll() {
    return this.membershipsRepository.findAll();
  }

  async findById(id: number) {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) {
      throw new NotFoundException(`Membership with id ${id} not found`);
    }
    return membership;
  }

  async create(dto: CreateMembershipDto) {
    return this.membershipsRepository.create(dto);
  }

  async update(id: number, dto: UpdateMembershipDto) {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) {
      throw new NotFoundException(`Membership with id ${id} not found`);
    }
    return this.membershipsRepository.updateById(id, dto);
  }

  async delete(id: number) {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) {
      throw new NotFoundException(`Membership with id ${id} not found`);
    }
    await this.membershipsRepository.deleteById(id);
    return { message: `The membership ${membership.name} was deleted` };
  }
}
