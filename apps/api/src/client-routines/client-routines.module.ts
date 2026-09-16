import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RoutinesModule } from '../routines/routines.module';
import { ClientRoutinesController } from './client-routines.controller';
import { ClientRoutinesService } from './client-routines.service';
import { ClientRoutinesRepository } from './client-routines.repository';

@Module({
  imports: [AuthModule, UsersModule, RoutinesModule],
  controllers: [ClientRoutinesController],
  providers: [ClientRoutinesService, ClientRoutinesRepository],
})
export class ClientRoutinesModule {}
