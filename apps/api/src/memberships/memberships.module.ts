import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { MembershipsRepository } from './memberships.repository';

@Module({
  imports: [AuthModule],
  controllers: [MembershipsController],
  providers: [MembershipsService, MembershipsRepository],
  exports: [MembershipsRepository],
})
export class MembershipsModule {}
