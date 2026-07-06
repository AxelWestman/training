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

  @Post('/createUser')
  @UsePipes(new ValidationPipe())
  createUsers(
    @Body()
    user: CreateUsersDto,
  ) {
    console.log("entramos en la función")
    return this.usersService.create(user);
  }

  
  
}
