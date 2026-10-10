import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import {
  applySchema,
  ensureTestDatabase,
  getTestDatabaseUrl,
  resetDatabase,
} from './helpers/test-database';
import { SeedUser, seedSuperadmin } from './helpers/seed';

jest.setTimeout(30000);

interface IdResponse {
  id: number;
}

interface AttendanceRecord {
  id: number;
  client_id: number;
  check_in: string;
}

function json<T>(response: { body: unknown }): T {
  return response.body as T;
}

describe('Full gym flow (e2e)', () => {
  let app: INestApplication<App>;
  let adminAgent: ReturnType<typeof request.agent>;
  let clientAgent: ReturnType<typeof request.agent>;
  let superadmin: SeedUser;

  const clientCredentials = {
    name: 'Juan',
    lastname: 'Perez',
    email: 'juan@test.com',
    password: 'secret123',
    dni: '40123456',
  };

  const state: {
    exerciseId?: number;
    routineId?: number;
    clientId?: number;
    membershipId?: number;
    clientMembershipId?: number;
  } = {};

  beforeAll(async () => {
    const testDatabaseUrl = getTestDatabaseUrl();
    process.env.DATABASE_URL = testDatabaseUrl;

    await ensureTestDatabase(testDatabaseUrl);
    await applySchema(testDatabaseUrl);
    await resetDatabase(testDatabaseUrl);
    superadmin = await seedSuperadmin(testDatabaseUrl);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    adminAgent = request.agent(app.getHttpServer());
    clientAgent = request.agent(app.getHttpServer());

    await adminAgent
      .post('/auth/login')
      .send({ email: superadmin.email, password: superadmin.password })
      .expect(201);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates an exercise', async () => {
    const response = await adminAgent
      .post('/exercises/createExercise')
      .send({
        name: 'Bench Press',
        description: 'Chest press with a barbell',
        muscle_group: 'chest',
        equipment: 'barbell',
      })
      .expect(201);

    state.exerciseId = json<IdResponse>(response).id;
    expect(state.exerciseId).toBeDefined();
  });

  it('creates a routine with the exercise', async () => {
    const response = await adminAgent
      .post('/routines/createRoutine')
      .send({
        name: 'Full Body',
        description: 'Test routine',
        exercises: [
          {
            exercise_id: state.exerciseId,
            day_of_week: 1,
            sets: 3,
            reps: 12,
            rest_time: 60,
            order: 0,
          },
        ],
      })
      .expect(201);

    state.routineId = json<IdResponse>(response).id;
    expect(state.routineId).toBeDefined();
  });

  it('registers a client', async () => {
    const response = await adminAgent
      .post('/users/createUser')
      .send(clientCredentials)
      .expect(201);

    state.clientId = json<IdResponse>(response).id;
    expect(state.clientId).toBeDefined();
  });

  it('creates a membership plan and assigns it to the client', async () => {
    const membershipResponse = await adminAgent
      .post('/memberships/createMembership')
      .send({ name: 'Mensual', duration_days: 30, price: 15000 })
      .expect(201);

    state.membershipId = json<IdResponse>(membershipResponse).id;

    const assignmentResponse = await adminAgent
      .post('/client-memberships/createClientMembership')
      .send({
        client_id: state.clientId,
        membership_id: state.membershipId,
        start_date: '2026-10-01',
      })
      .expect(201);

    state.clientMembershipId = json<IdResponse>(assignmentResponse).id;
    expect(state.clientMembershipId).toBeDefined();
  });

  it('records a payment for the client membership', async () => {
    await adminAgent
      .post('/payments/createPayment')
      .send({
        client_id: state.clientId,
        client_membership_id: state.clientMembershipId,
        amount: 15000,
        payment_date: '2026-10-01',
        due_date: '2026-10-01',
        method: 'cash',
        status: 'paid',
      })
      .expect(201);
  });

  it('assigns the routine to the client', async () => {
    await adminAgent
      .post('/client-routines/createClientRoutine')
      .send({
        client_id: state.clientId,
        routine_id: state.routineId,
        start_date: '2026-10-01',
      })
      .expect(201);
  });

  it('logs the client in and records a check-in', async () => {
    await clientAgent
      .post('/auth/login')
      .send({
        email: clientCredentials.email,
        password: clientCredentials.password,
      })
      .expect(201);

    const response = await clientAgent.post('/attendance/checkIn').expect(201);
    const record = json<AttendanceRecord>(response);
    expect(record.client_id).toBe(state.clientId);
  });

  it('rejects a second check-in on the same day', async () => {
    await clientAgent.post('/attendance/checkIn').expect(409);
  });

  it('shows the client their own attendance history', async () => {
    const response = await clientAgent
      .get('/attendance/myAttendance')
      .expect(200);

    const records = json<AttendanceRecord[]>(response);
    expect(records).toHaveLength(1);
    expect(records[0].client_id).toBe(state.clientId);
  });

  it('lets an admin view the client attendance history', async () => {
    const response = await adminAgent
      .get(`/attendance/client/${state.clientId}`)
      .expect(200);

    const records = json<AttendanceRecord[]>(response);
    expect(records).toHaveLength(1);
  });

  it('rejects a check-in without a session', async () => {
    await request(app.getHttpServer()).post('/attendance/checkIn').expect(401);
  });

  it('forbids an admin from checking in', async () => {
    await adminAgent.post('/attendance/checkIn').expect(403);
  });
});
