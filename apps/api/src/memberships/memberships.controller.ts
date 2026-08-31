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
import { MembershipsService } from './memberships.service';
import {
  CreateMembershipDto,
  UpdateMembershipDto,
  MembershipResponseDto,
} from './dto/memberships.dto';

@ApiTags('Memberships')
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('/getAllMemberships')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all membership plans' })
  @ApiResponse({
    status: 200,
    description: 'All membership plans, ordered by name',
    type: MembershipResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll() {
    return this.membershipsService.findAll();
  }

  @Get('/getMembership/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Get a single membership plan by id' })
  @ApiParam({ name: 'id', example: 1, description: 'Membership id' })
  @ApiResponse({
    status: 200,
    description: 'The membership plan',
    type: MembershipResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.membershipsService.findById(id);
  }

  @Post('/createMembership')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Create a membership plan (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Created membership plan',
    type: MembershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateMembershipDto) {
    return this.membershipsService.create(dto);
  }

  @Patch('/updateMembership/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Update a membership plan (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Membership id' })
  @ApiResponse({
    status: 200,
    description: 'Updated membership plan',
    type: MembershipResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMembershipDto,
  ) {
    return this.membershipsService.update(id, dto);
  }

  @Delete('/deleteMembership/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Delete a membership plan (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Membership id' })
  @ApiResponse({ status: 200, description: 'Deletion confirmation' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.membershipsService.delete(id);
  }
}
