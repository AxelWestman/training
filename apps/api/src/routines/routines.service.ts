import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RoutinesRepository } from './routines.repository';
import {
  CreateRoutineDto,
  UpdateRoutineDto,
  CreateRoutineExerciseDto,
  UpdateRoutineExerciseDto,
} from './dto/routines.dto';
import { ExercisesRepository } from '../exercises/exercises.repository';

@Injectable()
export class RoutinesService {
  constructor(
    private readonly routinesRepository: RoutinesRepository,
    private readonly exercisesRepository: ExercisesRepository,
  ) {}

  async findAll() {
    const routines = await this.routinesRepository.findAll();
    const result: any[] = [];
    for (const routine of routines) {
      const exercises = await this.routinesRepository.findExercisesByRoutineId(
        routine.id,
      );
      result.push({ ...routine, exercises });
    }
    return result;
  }

  async findById(id: number) {
    const routine = await this.routinesRepository.findById(id);
    if (!routine) {
      throw new NotFoundException(`Routine with id ${id} not found`);
    }
    const exercises =
      await this.routinesRepository.findExercisesByRoutineId(id);
    return { ...routine, exercises };
  }

  async create(dto: CreateRoutineDto, createdBy: number) {
    const routine = await this.routinesRepository.create(dto, createdBy);

    const exercises: any[] = [];
    if (dto.exercises && dto.exercises.length > 0) {
      for (const exDto of dto.exercises) {
        const exercise = await this.exercisesRepository.findById(
          exDto.exercise_id,
        );
        if (!exercise) {
          throw new NotFoundException(
            `Exercise with id ${exDto.exercise_id} not found`,
          );
        }
        const created = await this.routinesRepository.addExercise(
          routine.id,
          exDto,
        );
        exercises.push({
          ...created,
          exercise_name: exercise.name,
          muscle_group: exercise.muscle_group,
          equipment: exercise.equipment,
        });
      }
    }

    return { ...routine, exercises };
  }

  async update(id: number, dto: UpdateRoutineDto) {
    const routine = await this.routinesRepository.findById(id);
    if (!routine) {
      throw new NotFoundException(`Routine with id ${id} not found`);
    }
    return this.routinesRepository.updateById(id, dto);
  }

  async delete(id: number) {
    const routine = await this.routinesRepository.findById(id);
    if (!routine) {
      throw new NotFoundException(`Routine with id ${id} not found`);
    }
    await this.routinesRepository.deleteById(id);
    return { message: `The routine ${routine.name} was deleted` };
  }

  async addExercise(routineId: number, dto: CreateRoutineExerciseDto) {
    const routine = await this.routinesRepository.findById(routineId);
    if (!routine) {
      throw new NotFoundException(
        `Routine with id ${routineId} not found`,
      );
    }

    const exercise = await this.exercisesRepository.findById(dto.exercise_id);
    if (!exercise) {
      throw new NotFoundException(
        `Exercise with id ${dto.exercise_id} not found`,
      );
    }

    const created = await this.routinesRepository.addExercise(
      routineId,
      dto,
    );
    return {
      ...created,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      equipment: exercise.equipment,
    };
  }

  async updateExercise(
    routineId: number,
    exerciseId: number,
    dto: UpdateRoutineExerciseDto,
  ) {
    const routine = await this.routinesRepository.findById(routineId);
    if (!routine) {
      throw new NotFoundException(
        `Routine with id ${routineId} not found`,
      );
    }

    const existing = await this.routinesRepository.findExerciseById(
      routineId,
      exerciseId,
    );
    if (!existing) {
      throw new NotFoundException(
        `Routine exercise with id ${exerciseId} not found in routine ${routineId}`,
      );
    }

    return this.routinesRepository.updateExercise(
      routineId,
      exerciseId,
      dto,
    );
  }

  async removeExercise(routineId: number, exerciseId: number) {
    const routine = await this.routinesRepository.findById(routineId);
    if (!routine) {
      throw new NotFoundException(
        `Routine with id ${routineId} not found`,
      );
    }

    const removed = await this.routinesRepository.removeExercise(
      routineId,
      exerciseId,
    );
    if (!removed) {
      throw new NotFoundException(
        `Routine exercise with id ${exerciseId} not found in routine ${routineId}`,
      );
    }

    return {
      message: `Exercise ${removed.exercise_id} removed from routine ${routineId}`,
    };
  }
}
