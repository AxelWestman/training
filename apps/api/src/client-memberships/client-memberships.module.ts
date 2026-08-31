import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { ClientMembershipsController } from './client-memberships.controller';
import { ClientMembershipsService } from './client-memberships.service';
import { ClientMembershipsRepository } from './client-memberships.repository';

@Module({
  imports: [AuthModule, UsersModule, MembershipsModule],
  controllers: [ClientMembershipsController],
  providers: [ClientMembershipsService, ClientMembershipsRepository],
})
export class ClientMembershipsModule {}
