import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { AdminsRepository } from './admins.repository';

@Module({
  imports: [AuthModule],
  controllers: [AdminsController],
  providers: [AdminsService, AdminsRepository],
})
export class AdminsModule {}
