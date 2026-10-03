import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthUser } from '../database/database.types';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockRepository = {
    findUserByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  const dto = { email: 'admin@example.com', password: 'secret123' };

  const user: AuthUser = {
    id: 1,
    name: 'Ana',
    lastname: 'Lopez',
    email: dto.email,
    password_hash: 'hashed',
    type: 'admin',
    role: 'admin',
  };

  describe('login', () => {
    it('should throw UnauthorizedException when the user is not found', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when the password is invalid', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return a token and the user on success', async () => {
      mockRepository.findUserByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      await expect(service.login(dto)).resolves.toEqual({
        token: 'token',
        user: {
          id: user.id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          type: user.type,
          role: user.role,
        },
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        type: user.type,
        role: user.role,
      });
    });
  });
});
