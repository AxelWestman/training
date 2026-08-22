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
import { AdminsService } from './admins.service';
import {
  CreateAdminDto,
  UpdateAdminDto,
  AdminResponseDto,
} from './dto/admins.dto';

@ApiTags('Admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('/getAllAdmins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all admins' })
  @ApiResponse({
    status: 200,
    description: 'All admins, ordered by id',
    type: AdminResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll() {
    return this.adminsService.findAll();
  }

  @Get('/getAdmin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Get a single admin by id' })
  @ApiParam({ name: 'id', example: 1, description: 'Admin id' })
  @ApiResponse({ status: 200, description: 'The admin', type: AdminResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.findById(id);
  }

  @Post('/createAdmin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Create an admin (superadmin only)' })
  @ApiResponse({ status: 201, description: 'Created admin', type: AdminResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email or DNI already exists' })
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Patch('/updateAdmin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Update an admin (superadmin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Admin id' })
  @ApiResponse({ status: 200, description: 'Updated admin', type: AdminResponseDto })
  @ApiResponse({ status: 404, description: 'Admin not found' })
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
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Delete an admin (superadmin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Admin id' })
  @ApiResponse({ status: 200, description: 'Deleted admin', type: AdminResponseDto })
  @ApiResponse({ status: 403, description: 'Cannot delete yourself' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @User('sub') requestingAdminId: number,
  ) {
    return this.adminsService.delete(id, requestingAdminId);
  }
}
