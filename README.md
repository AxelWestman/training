# Monorepo Gimnasio

Monorepo with **NestJS** (backend), **Next.js** (frontend) and **PostgreSQL**.

## Structure

```
├── apps/
│   ├── api/          # NestJS - Backend (port 3001)
│   └── web/          # Next.js - Frontend (port 3000)
├── packages/         # Shared packages (optional)
├── docker-compose.yml
└── package.json      # npm workspaces root
```

## Requirements

- Node.js >= 20
- npm
- Docker (optional, for containers)

## Installation

```bash
npm install
```

## Local development

```bash
# Backend with hot-reload
npm run dev:api

# Frontend with hot-reload
npm run dev:web
```

Environment variables in `.env`.

## Build

```bash
npm run build
```

## Docker

```bash
# Start all services (PostgreSQL + API + Web)
docker compose up -d

# Development with hot-reload (syncs changes live)
docker compose up --watch

# View logs
docker compose logs -f

# Stop
docker compose down
```

> `docker compose up --watch` uses each app's `Dockerfile.dev` and automatically syncs source code changes to the container. The backend reloads with `nest start --watch` and the frontend with `next dev` (includes HMR).

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev:api` | Starts NestJS in watch mode |
| `npm run dev:web` | Starts Next.js in dev mode |
| `npm run build:api` | Builds the backend |
| `npm run build:web` | Builds the frontend |
| `npm run build` | Builds the whole monorepo |
| `npm run lint` | Lints both projects |

## Backend architecture

The backend follows a 3-layer architecture:

```
Controller → Service → Repository → Database (PostgreSQL via pg)
```

| Layer | Responsibility |
|-------|----------------|
| **Controller** | Handles HTTP routes, input validation (DTOs with `class-validator`) |
| **Service**   | Business logic, orchestration, domain validation |
| **Repository** | Data access, SQL queries (no ORM, using `pg.Pool`) |

The `users` module currently implements this pattern. New features must follow the same structure.

## API documentation (Swagger)

The API exposes interactive documentation with **Swagger UI** at:

```
http://localhost:3001/docs
```

It is configured in `apps/api/src/main.ts` using `@nestjs/swagger`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Gym Management API')
  .setDescription('Admin panel API for members, memberships, exercises, routines, payments, and attendance.')
  .setVersion('1.0')
  .addCookieAuth('session')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

From Swagger UI you can explore and test the endpoints (**Try it out** button), view request/response schemas and authenticate with the `session` cookie.

### Decorators used

| Decorator | Purpose |
|-----------|---------|
| `@ApiTags('Exercises')` | Groups a controller's endpoints under a section |
| `@ApiOperation({ summary })` | Adds a summary/description per endpoint |
| `@ApiResponse({ status, description, type })` | Documents response codes and their schema |
| `@ApiParam({ name, example })` | Documents path parameters |
| `@ApiProperty({ example })` | Describes fields of an input DTO |
| `@ApiPropertyOptional()` | Describes optional fields |
| `@ApiCookieAuth('session')` | Marks the endpoint as protected by the session cookie |

Response DTOs (e.g. `ExerciseResponseDto`, `UserResponseDto`) define the schema Swagger shows for each endpoint.

## API Endpoints — Users

| Method | Route | Description | Responses |
|--------|------|-------------|-----------|
| `POST` | `/users/createUser` | Creates a new user | `201` created · `401` not authenticated · `403` insufficient permissions · `409` duplicate email/DNI |
| `GET` | `/users/getAllUsers` | Gets all users | `200` array of users · `401` not authenticated · `403` insufficient permissions |
| `GET` | `/users/getUser/:id` | Gets a user by ID | `200` user · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `PATCH` | `/users/activateUser/:id` | Activates a user (`is_active = true`) | `200` user activated · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `PATCH` | `/users/deactivateUser/:id` | Deactivates a user (`is_active = false`) | `200` user deactivated · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `DELETE` | `/users/deleteUser/:id` | Deletes a user | `200` user deleted · `401` not authenticated · `403` insufficient permissions · `404` not found |

All user endpoints require the **admin** or **superadmin** role.

### Validations

- `POST /users/createUser` checks that the **email** and **DNI** do not exist before creating:
  - Duplicate email → `409 Conflict` — `"Email already exists"`
  - Duplicate DNI → `409 Conflict` — `"DNI already exists"`
- The `email` and `dni` columns have `UNIQUE` constraints in the database as a fallback.
- The `:id` parameter is validated with `ParseIntPipe` — if it is not an integer it responds `400 Bad Request`.

## API Endpoints — Auth

| Method | Route | Description | Responses |
|--------|------|-------------|-----------|
| `POST` | `/auth/login` | Logs in (admins and clients). Sets an httpOnly `session` cookie with a JWT | `201` user · `401` invalid credentials |
| `POST` | `/auth/logout` | Logs out and clears the `session` cookie | `200` logged out · `401` not authenticated |

Login looks up the email first in `admins`, then in `clients`. If the credentials are valid, it signs a JWT (payload: `sub`, `email`, `type`, `role`) and returns it in an httpOnly cookie with a 24h expiration. Logout requires authentication and clears the `session` cookie.

## API Endpoints — Admins

| Method | Route | Description | Responses |
|--------|------|-------------|-----------|
| `GET` | `/admins/getAllAdmins` | Gets all admins | `200` array of admins · `401` not authenticated · `403` insufficient permissions |
| `GET` | `/admins/getAdmin/:id` | Gets an admin by ID | `200` admin · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `POST` | `/admins/createAdmin` | Creates an admin or superadmin (superadmin only) | `201` admin created · `401` not authenticated · `403` not superadmin · `409` duplicate email/DNI |
| `PATCH` | `/admins/updateAdmin/:id` | Updates an admin (superadmin only) | `200` admin updated · `401` not authenticated · `403` not superadmin · `404` not found |
| `DELETE` | `/admins/deleteAdmin/:id` | Deletes an admin (superadmin only, not themselves) | `200` admin deleted · `401` not authenticated · `403` not superadmin · `404` not found |

- `GET /getAllAdmins` and `GET /getAdmin/:id` require the **admin** or **superadmin** role.
- `POST /createAdmin`, `PATCH /updateAdmin/:id` and `DELETE /deleteAdmin/:id` require the **superadmin** role.
- `DELETE /deleteAdmin/:id` does not allow deleting yourself (responds `403`).
- The `role` field is optional (default `admin`). Allowed values: `admin` | `superadmin`.

## API Endpoints — Exercises

| Method | Route | Description | Responses |
|--------|------|-------------|-----------|
| `GET` | `/exercises/getAllExercises` | Gets all exercises | `200` array of exercises · `401` not authenticated · `403` insufficient permissions |
| `GET` | `/exercises/getExercise/:id` | Gets an exercise by ID | `200` exercise · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `POST` | `/exercises/createExercise` | Creates a new exercise | `201` exercise created · `401` not authenticated · `403` insufficient permissions |
| `PATCH` | `/exercises/updateExercise/:id` | Updates an exercise | `200` exercise updated · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `DELETE` | `/exercises/deleteExercise/:id` | Deletes an exercise (responds `{ "message": "The exercise <name> was deleted" }`) | `200` exercise deleted · `401` not authenticated · `403` insufficient permissions · `404` not found |

- All endpoints require the **admin** or **superadmin** role.

## API Endpoints — Routines

| Method | Route | Description | Responses |
|--------|------|-------------|-----------|
| `GET` | `/routines/getAllRoutines` | Get all routines with their exercises | `200` array of routines · `401` not authenticated · `403` insufficient permissions |
| `GET` | `/routines/getRoutine/:id` | Get a routine by ID with its exercises | `200` routine · `401` not authenticated · `404` not found |
| `POST` | `/routines/createRoutine` | Create a routine (optionally with exercises) | `201` routine created · `401` not authenticated · `403` insufficient permissions · `404` exercise not found |
| `PATCH` | `/routines/updateRoutine/:id` | Update routine details | `200` routine updated · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `DELETE` | `/routines/deleteRoutine/:id` | Delete a routine and its associated exercises (CASCADE) | `200` routine deleted · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `POST` | `/routines/:id/addExercise` | Add an exercise to a routine | `201` exercise added · `401` not authenticated · `403` insufficient permissions · `404` routine/exercise not found |
| `PATCH` | `/routines/:id/updateExercise/:exerciseId` | Update an exercise's parameters within a routine | `200` exercise updated · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `DELETE` | `/routines/:id/removeExercise/:exerciseId` | Remove an exercise from a routine | `200` exercise removed · `401` not authenticated · `403` insufficient permissions · `404` not found |

- `GET /getRoutine/:id` requires authentication only (any logged-in user can view a routine).
- All other endpoints (`GET /getAllRoutines`, `POST`, `PATCH` and `DELETE`) require the **admin** or **superadmin** role.
- The routine's `created_by` is automatically assigned from the authenticated admin (extracted from the JWT).

### Request bodies (DTOs)

**POST /routines/createRoutine** — `CreateRoutineDto`
```json
{
  "name": "Push / Pull / Legs",
  "description": "3-day PPL routine (optional)",
  "exercises": [
    {
      "exercise_id": 1,
      "day_of_week": 1,
      "sets": 4,
      "reps": 10,
      "rest_time": 90,
      "order": 1,
      "notes": "Increase weight progressively"
    }
  ]
}
```

- `exercises` is an optional array. Each item (`CreateRoutineExerciseDto`) requires:
  - `exercise_id` (int) — ID of an existing exercise
  - `day_of_week` (int, 1–7) — Day of the week
  - `sets` (int, >= 1) — Number of sets
  - `reps` (int, >= 1) — Number of reps
  - `order` (int, >= 0) — Order within the day
  - `rest_time` (int, optional) — Rest time in seconds
  - `notes` (string, optional) — Additional notes

**PATCH /routines/updateRoutine/:id** — `UpdateRoutineDto`
```json
{
  "name": "New name",
  "description": "New description",
  "is_active": false
}
```
All fields are optional.

**PATCH /routines/:id/updateExercise/:exerciseId** — `UpdateRoutineExerciseDto`
```json
{
  "day_of_week": 2,
  "sets": 5,
  "reps": 8,
  "rest_time": 120,
  "order": 2,
  "notes": "Updated"
}
```
All fields are optional.

### Tables used

| Table | Purpose |
|-------|---------|
| `routines` | Main routine data (`name`, `description`, `created_by`, `is_active`) |
| `routine_exercises` | Assignment of exercises to routines with parameters (`day_of_week`, `sets`, `reps`, `rest_time`, `order`, `notes`) |
| `exercises` | Exercise catalog (JOIN to get `exercise_name`, `muscle_group`, `equipment`) |

## API Endpoints — Memberships

| Method | Route | Description | Responses |
|--------|------|-------------|-----------|
| `GET` | `/memberships/getAllMemberships` | Gets all membership plans | `200` array of plans · `401` not authenticated · `403` insufficient permissions |
| `GET` | `/memberships/getMembership/:id` | Gets a membership plan by ID | `200` plan · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `POST` | `/memberships/createMembership` | Creates a membership plan | `201` plan created · `400` validation error · `401` not authenticated · `403` insufficient permissions |
| `PATCH` | `/memberships/updateMembership/:id` | Updates a membership plan | `200` plan updated · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `DELETE` | `/memberships/deleteMembership/:id` | Deletes a membership plan (responds `{ "message": "The membership <name> was deleted" }`) | `200` plan deleted · `401` not authenticated · `403` insufficient permissions · `404` not found |

- All endpoints require the **admin** or **superadmin** role.

### Request bodies (DTOs)

**POST /memberships/createMembership** — `CreateMembershipDto`
```json
{
  "name": "Semestral",
  "duration_days": 180,
  "price": 75000,
  "is_active": true
}
```

- `name` (string, required) — Plan name
- `duration_days` (int, >= 1, required) — Duration in days
- `price` (number, >= 0, required) — Price
- `is_active` (boolean, optional, default `true`) — Whether the plan is active

**PATCH /memberships/updateMembership/:id** — `UpdateMembershipDto`. All fields are optional.

### Table used

| Table | Purpose |
|-------|---------|
| `memberships` | Membership plans (`name`, `duration_days`, `price`, `is_active`) |

## API Endpoints — Client Memberships

| Method | Route | Description | Responses |
|--------|------|-------------|-----------|
| `GET` | `/client-memberships/getAllClientMemberships` | Gets all client memberships (with client and plan names) | `200` array · `401` not authenticated · `403` insufficient permissions |
| `GET` | `/client-memberships/getClientMembership/:id` | Gets a client membership by ID | `200` record · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `GET` | `/client-memberships/client/:clientId` | Gets all memberships of a client | `200` array · `401` not authenticated · `403` insufficient permissions · `404` client not found |
| `POST` | `/client-memberships/createClientMembership` | Assigns a membership plan to a client | `201` record created · `400` validation error · `401` not authenticated · `403` insufficient permissions · `404` client/plan not found |
| `PATCH` | `/client-memberships/updateClientMembership/:id` | Updates dates or status | `200` record updated · `401` not authenticated · `403` insufficient permissions · `404` not found |
| `DELETE` | `/client-memberships/deleteClientMembership/:id` | Deletes a client membership | `200` record deleted · `401` not authenticated · `403` insufficient permissions · `404` not found |

- All endpoints require the **admin** or **superadmin** role.
- `POST /createClientMembership` validates that the **client** and the **membership plan** exist. If `end_date` is not provided, it is automatically computed as `start_date + duration_days` of the plan.
- `status` allowed values: `active` | `expired` | `cancelled` (default `active`).

### Request bodies (DTOs)

**POST /client-memberships/createClientMembership** — `CreateClientMembershipDto`
```json
{
  "client_id": 1,
  "membership_id": 1,
  "start_date": "2026-09-01",
  "end_date": "2026-12-01",
  "status": "active"
}
```

- `client_id` (int, required) — ID of an existing client
- `membership_id` (int, required) — ID of an existing membership plan
- `start_date` (date `YYYY-MM-DD`, required) — Start date
- `end_date` (date, optional) — End date (defaults to `start_date + duration_days`)
- `status` (string, optional) — `active` | `expired` | `cancelled`

**PATCH /client-memberships/updateClientMembership/:id** — `UpdateClientMembershipDto` (`start_date`, `end_date`, `status`, all optional).

### Tables used

| Table | Purpose |
|-------|---------|
| `client_memberships` | Assignment of a membership plan to a client (`client_id`, `membership_id`, `start_date`, `end_date`, `status`) |
| `clients` | Client data (JOIN for `client_name`) |
| `memberships` | Plan data (JOIN for `membership_name` and to compute `end_date`) |

### Guards

| Guard | Purpose |
|-------|---------|
| `JwtAuthGuard` | Verifies that a valid `session` cookie exists |
| `RolesGuard` | Restricts by user role. Used with the `@Roles()` decorator |

```typescript
@UseGuards(JwtAuthGuard)                            // any logged-in user
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')                       // admins only (admin or superadmin)
@Roles('superadmin')                                // superadmins only
```

### Security

- Passwords are hashed with **bcrypt** (salt rounds = 10) before being stored in both `clients.password` and `admins.password_hash`.
- Login signs a **JWT** stored in an **httpOnly** cookie (not accessible from JavaScript) with `sameSite: 'lax'` and a 24h expiration.
- Guards can be applied to any endpoint to validate the session and role before executing the logic.
