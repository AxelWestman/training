import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesRepository } from './routines.repository';
import { ExercisesRepository } from '../exercises/exercises.repository';
import {
  ExerciseRow,
  RoutineExerciseRow,
  RoutineRow,
} from '../database/database.types';

describe('RoutinesService', () => {
  let service: RoutinesService;

  const mockRoutinesRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findExercisesByRoutineId: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    addExercise: jest.fn(),
    findExerciseById: jest.fn(),
    updateExercise: jest.fn(),
    removeExercise: jest.fn(),
  };

  const mockExercisesRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutinesService,
        { provide: RoutinesRepository, useValue: mockRoutinesRepository },
        { provide: ExercisesRepository, useValue: mockExercisesRepository },
      ],
    }).compile();

    service = module.get<RoutinesService>(RoutinesService);
  });

  const routine = { id: 1, name: 'Full Body' } as RoutineRow;
  const exercise = {
    id: 10,
    name: 'Bench Press',
    muscle_group: 'chest',
    equipment: 'barbell',
  } as ExerciseRow;
  const routineExercise = {
    id: 100,
    routine_id: 1,
    exercise_id: 10,
  } as RoutineExerciseRow;
  const routineExerciseView = {
    ...routineExercise,
    exercise_name: 'Bench Press',
    muscle_group: 'chest',
    equipment: 'barbell',
  };

  describe('findAll', () => {
    it('should return each routine with its exercises', async () => {
      mockRoutinesRepository.findAll.mockResolvedValue([routine]);
      mockRoutinesRepository.findExercisesByRoutineId.mockResolvedValue([
        routineExerciseView,
      ]);

      await expect(service.findAll()).resolves.toEqual([
        { ...routine, exercises: [routineExerciseView] },
      ]);
      expect(
        mockRoutinesRepository.findExercisesByRoutineId,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException when the routine does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });

    it('should return the routine with its exercises', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockRoutinesRepository.findExercisesByRoutineId.mockResolvedValue([
        routineExerciseView,
      ]);

      await expect(service.findById(1)).resolves.toEqual({
        ...routine,
        exercises: [routineExerciseView],
      });
    });
  });

  describe('create', () => {
    it('should create a routine without exercises', async () => {
      mockRoutinesRepository.create.mockResolvedValue(routine);

      await expect(service.create({ name: 'Full Body' }, 1)).resolves.toEqual({
        ...routine,
        exercises: [],
      });
      expect(mockExercisesRepository.findById).not.toHaveBeenCalled();
    });

    it('should create a routine with enriched exercises', async () => {
      const exDto = {
        exercise_id: 10,
        day_of_week: 1,
        sets: 3,
        reps: 12,
        order: 0,
      };
      mockRoutinesRepository.create.mockResolvedValue(routine);
      mockExercisesRepository.findById.mockResolvedValue(exercise);
      mockRoutinesRepository.addExercise.mockResolvedValue(routineExercise);

      await expect(
        service.create({ name: 'Full Body', exercises: [exDto] }, 1),
      ).resolves.toEqual({
        ...routine,
        exercises: [routineExerciseView],
      });
      expect(mockRoutinesRepository.addExercise).toHaveBeenCalledWith(1, exDto);
    });

    it('should throw NotFoundException when an exercise does not exist', async () => {
      const exDto = {
        exercise_id: 99,
        day_of_week: 1,
        sets: 3,
        reps: 12,
        order: 0,
      };
      mockRoutinesRepository.create.mockResolvedValue(routine);
      mockExercisesRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Full Body', exercises: [exDto] }, 1),
      ).rejects.toThrow(NotFoundException);
      expect(mockRoutinesRepository.addExercise).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when the routine does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update the routine', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockRoutinesRepository.updateById.mockResolvedValue({
        ...routine,
        name: 'Push',
      });

      await expect(service.update(1, { name: 'Push' })).resolves.toEqual({
        ...routine,
        name: 'Push',
      });
      expect(mockRoutinesRepository.updateById).toHaveBeenCalledWith(1, {
        name: 'Push',
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when the routine does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete the routine and return a message', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockRoutinesRepository.deleteById.mockResolvedValue({ id: 1 });

      await expect(service.delete(1)).resolves.toEqual({
        message: 'The routine Full Body was deleted',
      });
      expect(mockRoutinesRepository.deleteById).toHaveBeenCalledWith(1);
    });
  });

  describe('addExercise', () => {
    const dto = {
      exercise_id: 10,
      day_of_week: 1,
      sets: 3,
      reps: 12,
      order: 0,
    };

    it('should throw NotFoundException when the routine does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.addExercise(1, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the exercise does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockExercisesRepository.findById.mockResolvedValue(null);

      await expect(service.addExercise(1, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should add the exercise and enrich the response', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockExercisesRepository.findById.mockResolvedValue(exercise);
      mockRoutinesRepository.addExercise.mockResolvedValue(routineExercise);

      await expect(service.addExercise(1, dto)).resolves.toEqual(
        routineExerciseView,
      );
      expect(mockRoutinesRepository.addExercise).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateExercise', () => {
    it('should throw NotFoundException when the routine does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.updateExercise(1, 100, { sets: 4 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the routine exercise does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockRoutinesRepository.findExerciseById.mockResolvedValue(null);

      await expect(service.updateExercise(1, 100, { sets: 4 })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRoutinesRepository.updateExercise).not.toHaveBeenCalled();
    });

    it('should update the routine exercise', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockRoutinesRepository.findExerciseById.mockResolvedValue(
        routineExercise,
      );
      mockRoutinesRepository.updateExercise.mockResolvedValue({
        ...routineExercise,
        sets: 4,
      });

      await expect(
        service.updateExercise(1, 100, { sets: 4 }),
      ).resolves.toEqual({ ...routineExercise, sets: 4 });
      expect(mockRoutinesRepository.updateExercise).toHaveBeenCalledWith(
        1,
        100,
        { sets: 4 },
      );
    });
  });

  describe('removeExercise', () => {
    it('should throw NotFoundException when the routine does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(null);

      await expect(service.removeExercise(1, 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the routine exercise does not exist', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockRoutinesRepository.removeExercise.mockResolvedValue(null);

      await expect(service.removeExercise(1, 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove the exercise and return a message', async () => {
      mockRoutinesRepository.findById.mockResolvedValue(routine);
      mockRoutinesRepository.removeExercise.mockResolvedValue({
        id: 100,
        exercise_id: 10,
      });

      await expect(service.removeExercise(1, 100)).resolves.toEqual({
        message: 'Exercise 10 removed from routine 1',
      });
      expect(mockRoutinesRepository.removeExercise).toHaveBeenCalledWith(
        1,
        100,
      );
    });
  });
});
