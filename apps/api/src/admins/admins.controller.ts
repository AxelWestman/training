import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/admins.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post('/createAdmin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }
}
