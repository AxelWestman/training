import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { ExercisesModule } from './exercises/exercises.module';
import { RoutinesModule } from './routines/routines.module';
import { MembershipsModule } from './memberships/memberships.module';
import { ClientMembershipsModule } from './client-memberships/client-memberships.module';
import { PaymentsModule } from './payments/payments.module';
import { ClientRoutinesModule } from './client-routines/client-routines.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    DatabaseModule,
    UsersModule,
    AdminsModule,
    AuthModule,
    ExercisesModule,
    RoutinesModule,
    MembershipsModule,
    ClientMembershipsModule,
    PaymentsModule,
    ClientRoutinesModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
