import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { CreateUsersDto } from './dto/users.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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

    return this.usersRepository.create(dto);
  }
}
