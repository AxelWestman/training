import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ClientMembershipsModule } from '../client-memberships/client-memberships.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';

@Module({
  imports: [AuthModule, UsersModule, ClientMembershipsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
