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
import { ClientMembershipsService } from './client-memberships.service';
import {
  CreateClientMembershipDto,
  UpdateClientMembershipDto,
  ClientMembershipResponseDto,
} from './dto/client-memberships.dto';

@ApiTags('Client Memberships')
@Controller('client-memberships')
export class ClientMembershipsController {
  constructor(
    private readonly clientMembershipsService: ClientMembershipsService,
  ) {}

  @Get('/getAllClientMemberships')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all client memberships' })
  @ApiResponse({
    status: 200,
    description: 'All client memberships',
    type: ClientMembershipResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll() {
    return this.clientMembershipsService.findAll();
  }

  @Get('/getClientMembership/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Get a single client membership by id' })
  @ApiParam({ name: 'id', example: 1, description: 'Client membership id' })
  @ApiResponse({
    status: 200,
    description: 'The client membership',
    type: ClientMembershipResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Client membership not found' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.clientMembershipsService.findById(id);
  }

  @Get('/client/:clientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all memberships of a client' })
  @ApiParam({ name: 'clientId', example: 1, description: 'Client id' })
  @ApiResponse({
    status: 200,
    description: 'Client memberships for the client',
    type: ClientMembershipResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findByClientId(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.clientMembershipsService.findByClientId(clientId);
  }

  @Post('/createClientMembership')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({
    summary: 'Assign a membership plan to a client (admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Created client membership',
    type: ClientMembershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Client or membership not found' })
  create(@Body() dto: CreateClientMembershipDto) {
    return this.clientMembershipsService.create(dto);
  }

  @Patch('/updateClientMembership/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Update a client membership (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Client membership id' })
  @ApiResponse({
    status: 200,
    description: 'Updated client membership',
    type: ClientMembershipResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Client membership not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientMembershipDto,
  ) {
    return this.clientMembershipsService.update(id, dto);
  }

  @Delete('/deleteClientMembership/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Delete a client membership (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Client membership id' })
  @ApiResponse({ status: 200, description: 'Deletion confirmation' })
  @ApiResponse({ status: 404, description: 'Client membership not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.clientMembershipsService.delete(id);
  }
}
