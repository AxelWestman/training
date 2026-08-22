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
import { User } from '../auth/guards/user.decorator';
import { RoutinesService } from './routines.service';
import {
  CreateRoutineDto,
  UpdateRoutineDto,
  CreateRoutineExerciseDto,
  UpdateRoutineExerciseDto,
  RoutineResponseDto,
  RoutineExerciseResponseDto,
} from './dto/routines.dto';

@ApiTags('Routines')
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get('/getAllRoutines')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all routines with their exercises' })
  @ApiResponse({
    status: 200,
    description: 'All routines, ordered by name',
    type: RoutineResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll() {
    return this.routinesService.findAll();
  }

  @Get('/getRoutine/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Get a single routine by id' })
  @ApiParam({ name: 'id', example: 1, description: 'Routine id' })
  @ApiResponse({ status: 200, description: 'The routine', type: RoutineResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.routinesService.findById(id);
  }

  @Post('/createRoutine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Create a routine (admin only)' })
  @ApiResponse({ status: 201, description: 'Created routine', type: RoutineResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateRoutineDto, @User('sub') userId: number) {
    return this.routinesService.create(dto, userId);
  }

  @Patch('/updateRoutine/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Update a routine (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Routine id' })
  @ApiResponse({ status: 200, description: 'Updated routine', type: RoutineResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoutineDto) {
    return this.routinesService.update(id, dto);
  }

  @Delete('/deleteRoutine/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Delete a routine (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Routine id' })
  @ApiResponse({ status: 200, description: 'Deletion confirmation' })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.routinesService.delete(id);
  }

  @Post('/:id/addExercise')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Add an exercise to a routine (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Routine id' })
  @ApiResponse({
    status: 201,
    description: 'Added routine exercise',
    type: RoutineExerciseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Routine or exercise not found' })
  addExercise(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRoutineExerciseDto,
  ) {
    return this.routinesService.addExercise(id, dto);
  }

  @Patch('/:id/updateExercise/:exerciseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Update an exercise within a routine (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Routine id' })
  @ApiParam({ name: 'exerciseId', example: 1, description: 'Routine exercise id' })
  @ApiResponse({
    status: 200,
    description: 'Updated routine exercise',
    type: RoutineExerciseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Routine exercise not found' })
  updateExercise(
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() dto: UpdateRoutineExerciseDto,
  ) {
    return this.routinesService.updateExercise(id, exerciseId, dto);
  }

  @Delete('/:id/removeExercise/:exerciseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Remove an exercise from a routine (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Routine id' })
  @ApiParam({ name: 'exerciseId', example: 1, description: 'Routine exercise id' })
  @ApiResponse({ status: 200, description: 'Removal confirmation' })
  @ApiResponse({ status: 404, description: 'Routine exercise not found' })
  removeExercise(
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.routinesService.removeExercise(id, exerciseId);
  }
}
