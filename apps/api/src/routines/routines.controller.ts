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
import { User } from '../auth/guards/user.decorator';
import { RoutinesService } from './routines.service';
import {
  CreateRoutineDto,
  UpdateRoutineDto,
  CreateRoutineExerciseDto,
  UpdateRoutineExerciseDto,
} from './dto/routines.dto';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get('/getAllRoutines')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.routinesService.findAll();
  }

  @Get('/getRoutine/:id')
  @UseGuards(JwtAuthGuard)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.routinesService.findById(id);
  }

  @Post('/createRoutine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CreateRoutineDto, @User('sub') userId: number) {
    return this.routinesService.create(dto, userId);
  }

  @Patch('/updateRoutine/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoutineDto,
  ) {
    return this.routinesService.update(id, dto);
  }

  @Delete('/deleteRoutine/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.routinesService.delete(id);
  }

  @Post('/:id/addExercise')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
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
  removeExercise(
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.routinesService.removeExercise(id, exerciseId);
  }
}
