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
} from '@nestjs/common';
import { CreateUsersDto } from './dto/users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/getAllUsers')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('/getUser/:id')
  getUserById(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.findById(id);
  }

  @Patch('activateUser/:id')
  activateUser(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.activate(id);
  }

  @Patch('deactivateUser/:id')
  deactivateUser(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.deactivate(id);
  }

  @Delete('deleteUser/:id')
  deleteUser(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.delete(id);
  }

  @Post('/createUser')
  @UsePipes(new ValidationPipe())
  createUsers(
    @Body()
    user: CreateUsersDto,
  ) {
    return this.usersService.create(user);
  }
}
