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
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentResponseDto,
} from './dto/payments.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('/getAllPayments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all payments' })
  @ApiResponse({
    status: 200,
    description: 'All payments with client and plan names',
    type: PaymentResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('/getPayment/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Get a single payment by id' })
  @ApiParam({ name: 'id', example: 1, description: 'Payment id' })
  @ApiResponse({
    status: 200,
    description: 'The payment',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findById(id);
  }

  @Get('/client/:clientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'List all payments of a client' })
  @ApiParam({ name: 'clientId', example: 1, description: 'Client id' })
  @ApiResponse({
    status: 200,
    description: 'Payments for the client',
    type: PaymentResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findByClientId(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.paymentsService.findByClientId(clientId);
  }

  @Post('/createPayment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Create a payment (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Created payment',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 404,
    description: 'Client or client membership not found',
  })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Patch('/updatePayment/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Update a payment (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Payment id' })
  @ApiResponse({
    status: 200,
    description: 'Updated payment',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment or client membership not found',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete('/deletePayment/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiCookieAuth('session')
  @ApiOperation({ summary: 'Delete a payment (admin only)' })
  @ApiParam({ name: 'id', example: 1, description: 'Payment id' })
  @ApiResponse({ status: 200, description: 'Deletion confirmation' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.delete(id);
  }
}
