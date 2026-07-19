import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminsRepository } from './admins.repository';
import { CreateAdminDto } from './dto/admins.dto';

@Injectable()
export class AdminsService {
  constructor(private readonly adminsRepository: AdminsRepository) {}

  async create(dto: CreateAdminDto) {
    const existing = await this.adminsRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    dto.password = await bcrypt.hash(dto.password, salt);

    return this.adminsRepository.create(dto);
  }
}
