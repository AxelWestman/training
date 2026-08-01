import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { ExercisesRepository } from './exercises.repository';

@Module({
  imports: [AuthModule],
  controllers: [ExercisesController],
  providers: [ExercisesService, ExercisesRepository],
  exports: [ExercisesRepository],
})
export class ExercisesModule {}
