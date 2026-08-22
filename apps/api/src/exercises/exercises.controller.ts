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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ExercisesService } from './exercises.service';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  ExerciseResponseDto,
} from './dto/exercises.dto';

@ApiTags('Exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get('/getAllExercises')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all exercises' })
  @ApiResponse({
    status: 200,
    description: 'All exercises, ordered by name',
    type: ExerciseResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll() {
    return this.exercisesService.findAll();
  }

  @Get('/getExercise/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Get a single exercise by id' })
  @ApiParam({ name: 'id', example: 1, description: 'Exercise id' })
  @ApiResponse({
    status: 200,
    description: 'The exercise',
    type: ExerciseResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.findById(id);
  }

  @Post('/createExercise')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Create an exercise (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Created exercise',
    type: ExerciseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateExerciseDto) {
    return this.exercisesService.create(dto);
  }

  @Patch('/updateExercise/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Update an exercise (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Exercise id' })
  @ApiResponse({
    status: 200,
    description: 'Updated exercise',
    type: ExerciseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, dto);
  }

  @Delete('/deleteExercise/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Delete an exercise (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Exercise id' })
  @ApiResponse({ status: 200, description: 'Deletion confirmation' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.delete(id);
  }
}
