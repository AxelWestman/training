import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUsersDto } from './dto/users.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll() {
    return this.usersRepository.findAll();
  }

  async activate(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const activateUser = await this.usersRepository.activateById(id);
    return {
      message: `El usuario ${activateUser.name} ${activateUser.lastname} ha sido activado.`,
    };
  }

  async deactivate(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const deactivateUser = await this.usersRepository.deactivateById(id);
    return {
      message: `El usuario ${deactivateUser.name} ${deactivateUser.lastname} ha sido desactivado.`,
    };
  }

  async findById(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async delete(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const eliminate_id = await this.usersRepository.deleteById(id);

    return {
      message: `El usuario ${user.name} ${user.lastname} con id ${eliminate_id.id} ha sido eliminado.`,
    };
  }

  async create(dto: CreateUsersDto) {
    const [existingEmail, existingDni] = await Promise.all([
      this.usersRepository.findByEmail(dto.email),
      this.usersRepository.findByDni(dto.dni),
    ]);

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    if (existingDni) {
      throw new ConflictException('DNI already exists');
    }

    const salt = await bcrypt.genSalt(10);
    dto.password = await bcrypt.hash(dto.password, salt);

    return this.usersRepository.create(dto);
  }
}
