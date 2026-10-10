import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
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
import { AttendanceService } from './attendance.service';
import { AttendanceResponseDto } from './dto/attendance.dto';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('/checkIn')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @ApiCookieAuth('session')
  @ApiOperation({
    summary: 'Record a gym check-in for the authenticated client',
  })
  @ApiResponse({
    status: 201,
    description: 'Created check-in',
    type: AttendanceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 409, description: 'Already checked in today' })
  checkIn(@User('sub') clientId: number) {
    return this.attendanceService.checkIn(clientId);
  }

  @Get('/myAttendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @ApiCookieAuth('session')
  @ApiOperation({
    summary: 'List the authenticated client own attendance history',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance records, most recent first',
    type: AttendanceResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  myAttendance(@User('sub') clientId: number) {
    return this.attendanceService.findByClientId(clientId);
  }

  @Get('/client/:clientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({
    summary: 'List the attendance history of a client (admin only)',
  })
  @ApiParam({ name: 'clientId', example: 1, description: 'Client id' })
  @ApiResponse({
    status: 200,
    description: 'Attendance records, most recent first',
    type: AttendanceResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findByClientId(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.attendanceService.findByClientId(clientId);
  }
}
