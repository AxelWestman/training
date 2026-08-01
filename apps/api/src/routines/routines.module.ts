import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { RoutinesRepository } from './routines.repository';

@Module({
  imports: [AuthModule, ExercisesModule],
  controllers: [RoutinesController],
  providers: [RoutinesService, RoutinesRepository],
})
export class RoutinesModule {}
