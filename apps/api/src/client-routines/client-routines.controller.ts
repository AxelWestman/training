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
import { ClientRoutinesService } from './client-routines.service';
import type { JwtUser } from '../database/database.types';
import {
  CreateClientRoutineDto,
  UpdateClientRoutineDto,
  ClientRoutineResponseDto,
} from './dto/client-routines.dto';

@ApiTags('Client Routines')
@Controller('client-routines')
export class ClientRoutinesController {
  constructor(private readonly clientRoutinesService: ClientRoutinesService) {}

  @Get('/getAllClientRoutines')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all client routines' })
  @ApiResponse({
    status: 200,
    description: 'All client routines with client and routine names',
    type: ClientRoutineResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll() {
    return this.clientRoutinesService.findAll();
  }

  @Get('/getClientRoutine/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Get a single client routine by id' })
  @ApiParam({ name: 'id', example: 1, description: 'Client routine id' })
  @ApiResponse({
    status: 200,
    description: 'The client routine',
    type: ClientRoutineResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Client routine not found' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.clientRoutinesService.findById(id);
  }

  @Get('/client/:clientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin', 'client')
  @ApiCookieAuth('session')
  @ApiOperation({
    summary:
      'List all routines assigned to a client (admins: anyone, clients: only their own)',
  })
  @ApiParam({ name: 'clientId', example: 1, description: 'Client id' })
  @ApiResponse({
    status: 200,
    description: 'Client routines for the client',
    type: ClientRoutineResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 403,
    description: 'Client can only view their own routines',
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findByClientId(
    @Param('clientId', ParseIntPipe) clientId: number,
    @User() user: JwtUser,
  ) {
    return this.clientRoutinesService.findByClientId(clientId, user);
  }

  @Get('/routine/:routineId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all clients assigned to a routine' })
  @ApiParam({ name: 'routineId', example: 1, description: 'Routine id' })
  @ApiResponse({
    status: 200,
    description: 'Client routines for the routine',
    type: ClientRoutineResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  findByRoutineId(@Param('routineId', ParseIntPipe) routineId: number) {
    return this.clientRoutinesService.findByRoutineId(routineId);
  }

  @Post('/createClientRoutine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({
    summary:
      'Assign a routine to a client (admin only). assigned_by comes from the JWT',
  })
  @ApiResponse({
    status: 201,
    description: 'Created client routine',
    type: ClientRoutineResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Client or routine not found' })
  create(@Body() dto: CreateClientRoutineDto, @User('sub') userId: number) {
    return this.clientRoutinesService.create(dto, userId);
  }

  @Patch('/updateClientRoutine/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Update a client routine (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Client routine id' })
  @ApiResponse({
    status: 200,
    description: 'Updated client routine',
    type: ClientRoutineResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Client routine not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientRoutineDto,
  ) {
    return this.clientRoutinesService.update(id, dto);
  }

  @Delete('/deleteClientRoutine/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Delete a client routine (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Client routine id' })
  @ApiResponse({ status: 200, description: 'Deletion confirmation' })
  @ApiResponse({ status: 404, description: 'Client routine not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.clientRoutinesService.delete(id);
  }
}
