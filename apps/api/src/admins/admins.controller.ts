import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/admins.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post('/createAdmin')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }
}
