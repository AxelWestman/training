import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercises.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get('/getAllExercises')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.exercisesService.findAll();
  }

  @Get('/getExercise/:id')
  @UseGuards(JwtAuthGuard)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.findById(id);
  }

  @Post('/createExercise')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CreateExerciseDto) {
    return this.exercisesService.create(dto);
  }

  @Patch('/updateExercise/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, dto);
  }

  @Delete('/deleteExercise/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.delete(id);
  }
}
