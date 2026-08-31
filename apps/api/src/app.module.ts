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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
