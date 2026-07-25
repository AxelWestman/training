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
import { AdminsService } from './admins.service';
import { CreateAdminDto, UpdateAdminDto } from './dto/admins.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('/getAllAdmins')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.adminsService.findAll();
  }

  @Get('/getAdmin/:id')
  @UseGuards(JwtAuthGuard)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.findById(id);
  }

  @Post('/createAdmin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @UsePipes(new ValidationPipe())
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Patch('/updateAdmin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @UsePipes(new ValidationPipe())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminDto,
    @User('sub') requestingAdminId: number,
  ) {
    return this.adminsService.update(id, dto, requestingAdminId);
  }

  @Delete('/deleteAdmin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @User('sub') requestingAdminId: number,
  ) {
    return this.adminsService.delete(id, requestingAdminId);
  }
}
