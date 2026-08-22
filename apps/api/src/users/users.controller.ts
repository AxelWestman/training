import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
import { CreateUsersDto, UserResponseDto } from './dto/users.dto';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/guards/roles.decorator';

@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth('session')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/getAllUsers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({
    status: 200,
    description: 'All users, ordered by id',
    type: UserResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('/getUser/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Get a single user by id' })
  @ApiParam({ name: 'id', example: 1, description: 'User id' })
  @ApiResponse({ status: 200, description: 'The user', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.findById(id);
  }

  @Patch('activateUser/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Activate a user' })
  @ApiParam({ name: 'id', example: 1, description: 'User id' })
  @ApiResponse({ status: 200, description: 'Activation confirmation' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  activateUser(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.activate(id);
  }

  @Patch('deactivateUser/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiParam({ name: 'id', example: 1, description: 'User id' })
  @ApiResponse({ status: 200, description: 'Deactivation confirmation' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivateUser(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.deactivate(id);
  }

  @Delete('deleteUser/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', example: 1, description: 'User id' })
  @ApiResponse({ status: 200, description: 'Deletion confirmation' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.delete(id);
  }

  @Post('/createUser')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @ApiCookieAuth('session')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, description: 'Created user', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 409, description: 'Email or DNI already exists' })
  createUsers(
    @Body()
    user: CreateUsersDto,
  ) {
    return this.usersService.create(user);
  }
}
