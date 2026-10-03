import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesRepository } from './exercises.repository';
import { ExerciseRow } from '../database/database.types';

describe('ExercisesService', () => {
  let service: ExercisesService;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: ExercisesRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
  });

  const exercise = {
    id: 1,
    name: 'Bench Press',
    muscle_group: 'chest',
  } as ExerciseRow;

  describe('findAll', () => {
    it('should return all exercises', async () => {
      const exercises = [exercise];
      mockRepository.findAll.mockResolvedValue(exercises);

      await expect(service.findAll()).resolves.toBe(exercises);
    });
  });

  describe('findById', () => {
    it('should return the exercise when it exists', async () => {
      mockRepository.findById.mockResolvedValue(exercise);

      await expect(service.findById(1)).resolves.toBe(exercise);
    });

    it('should throw NotFoundException when the exercise does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create the exercise', async () => {
      const dto = { name: 'Squat', muscle_group: 'legs' };
      mockRepository.create.mockResolvedValue({ id: 2, ...dto });

      await expect(service.create(dto)).resolves.toEqual({ id: 2, ...dto });
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when the exercise does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update the exercise', async () => {
      mockRepository.findById.mockResolvedValue(exercise);
      mockRepository.updateById.mockResolvedValue({
        ...exercise,
        name: 'Incline Bench Press',
      });

      await expect(
        service.update(1, { name: 'Incline Bench Press' }),
      ).resolves.toEqual({ ...exercise, name: 'Incline Bench Press' });
      expect(mockRepository.updateById).toHaveBeenCalledWith(1, {
        name: 'Incline Bench Press',
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when the exercise does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete the exercise and return a message', async () => {
      mockRepository.findById.mockResolvedValue(exercise);
      mockRepository.deleteById.mockResolvedValue({
        id: 1,
        name: 'Bench Press',
      });

      await expect(service.delete(1)).resolves.toEqual({
        message: 'The exercise Bench Press was deleted',
      });
      expect(mockRepository.deleteById).toHaveBeenCalledWith(1);
    });
  });
});
