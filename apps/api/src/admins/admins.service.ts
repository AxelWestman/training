import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminsRepository } from './admins.repository';
import { CreateAdminDto, UpdateAdminDto } from './dto/admins.dto';

@Injectable()
export class AdminsService {
  constructor(private readonly adminsRepository: AdminsRepository) {}

  async findAll() {
    return this.adminsRepository.findAll();
  }

  async findById(id: number) {
    const admin = await this.adminsRepository.findById(id);
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }
    return admin;
  }

  async create(dto: CreateAdminDto) {
    const [existingEmail, existingDni] = await Promise.all([
      this.adminsRepository.findByEmail(dto.email),
      this.adminsRepository.findByDni(dto.dni),
    ]);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    if (existingDni) {
      throw new ConflictException('DNI already exists');
    }

    const salt = await bcrypt.genSalt(10);
    dto.password = await bcrypt.hash(dto.password, salt);

    return this.adminsRepository.create(dto);
  }

  async update(id: number, dto: UpdateAdminDto, requestingAdminId: number) {
    const admin = await this.adminsRepository.findById(id);
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }

    if (dto.email) {
      const existing = await this.adminsRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      dto.password = await bcrypt.hash(dto.password, salt);
    }

    return this.adminsRepository.updateById(id, dto);
  }

  async delete(id: number, requestingAdminId: number) {
    if (id === requestingAdminId) {
      throw new ForbiddenException('Cannot delete yourself');
    }

    const admin = await this.adminsRepository.findById(id);
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }

    return this.adminsRepository.deleteById(id);
  }
}
