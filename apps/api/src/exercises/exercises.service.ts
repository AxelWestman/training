import { Injectable, NotFoundException } from '@nestjs/common';
import { ExercisesRepository } from './exercises.repository';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercises.dto';

@Injectable()
export class ExercisesService {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async findAll() {
    return this.exercisesRepository.findAll();
  }

  async findById(id: number) {
    const exercise = await this.exercisesRepository.findById(id);
    if (!exercise) {
      throw new NotFoundException(`Exercise with id ${id} not found`);
    }
    return exercise;
  }

  async create(dto: CreateExerciseDto) {
    return this.exercisesRepository.create(dto);
  }

  async update(id: number, dto: UpdateExerciseDto) {
    const exercise = await this.exercisesRepository.findById(id);
    if (!exercise) {
      throw new NotFoundException(`Exercise with id ${id} not found`);
    }
    return this.exercisesRepository.updateById(id, dto);
  }

  async delete(id: number) {
    const exercise = await this.exercisesRepository.findById(id);
    if (!exercise) {
      throw new NotFoundException(`Exercise with id ${id} not found`);
    }
    await this.exercisesRepository.deleteById(id);
    return { message: `The exercise ${exercise.name} was deleted` };
  }
}
