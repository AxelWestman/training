# Diary - Coding Sessions

## Session 1 — 2025-07-25

### Created Exercises CRUD module

Created the full `exercises` module in `apps/api/src/exercises/` following the existing 3-layer architecture:

- **DTOs** — `CreateExerciseDto` and `UpdateExerciseDto` with class-validator decorators
- **Repository** — Raw SQL queries (findAll, findById, create, updateById, deleteById) via pg.Pool
- **Service** — Business logic with NotFoundException handling
- **Controller** — REST endpoints with guards:
  - `GET /exercises/getAllExercises` and `GET /exercises/getExercise/:id` — any authenticated user
  - `POST /exercises/createExercise`, `PATCH /exercises/updateExercise/:id`, `DELETE /exercises/deleteExercise/:id` — requires `admin` or `superadmin` role
- **Module** — Registered `ExercisesModule` in `AppModule`

**Schema reference:** `database/schema.sql` — exercises table has: id, name, description, muscle_group, equipment, image_url, created_at, updated_at

---

## Session 2 — 2026-08-01

### Created Routines CRUD module

Created the full `routines` module in `apps/api/src/routines/` following the existing 3-layer architecture:

- **DTOs** — `CreateRoutineDto`, `UpdateRoutineDto`, `CreateRoutineExerciseDto` and `UpdateRoutineExerciseDto` with class-validator decorators. `CreateRoutineDto` accepts an optional `exercises` array to create a routine with its exercises in one request.
- **Repository** — Raw SQL queries via `pg.Pool` covering:
  - Routines: findAll, findById, create (with admin `created_by`), updateById (dynamic fields), deleteById
  - Routine exercises: findExercisesByRoutineId (with JOIN on exercises table), findExerciseById, addExercise, updateExercise (dynamic fields), removeExercise
- **Service** — Business logic: validates routine and exercise existence, resolves exercises by ID when creating, returns enriched data (exercise_name, muscle_group, equipment via JOIN)
- **Controller** — 8 REST endpoints with auth guards:
  - `GET /routines/getAllRoutines` and `GET /routines/getRoutine/:id` — any authenticated user, returns routines with nested exercises
  - `POST /routines/createRoutine` — admin/superadmin, extracts `created_by` from JWT via `@User('sub')`
  - `PATCH /routines/updateRoutine/:id` and `DELETE /routines/deleteRoutine/:id` — admin/superadmin
  - `POST /routines/:id/addExercise`, `PATCH /routines/:id/updateExercise/:exerciseId`, `DELETE /routines/:id/removeExercise/:exerciseId` — admin/superadmin, manages exercises within a routine
- **Module** — Registered `RoutinesModule` in `AppModule`; exports `ExercisesRepository` from `ExercisesModule` to allow dependency injection in `RoutinesService`
- **Documentation** — Added API endpoints documentation to `README.md` (translated to English)

**Schema reference:** `database/schema.sql` — routines (id, name, description, created_by FK, is_active), routine_exercises (id, routine_id FK CASCADE, exercise_id FK CASCADE, day_of_week, sets, reps, rest_time, "order", notes)

---

## Session 3 — 2026-08-22

### Added Swagger (API documentation)

- Installed `@nestjs/swagger` and `swagger-ui-express` (workspace `apps/api`).
- Configured Swagger in `apps/api/src/main.ts` via `DocumentBuilder` + `SwaggerModule.setup('docs', ...)`. Available at `http://localhost:3001/docs`. Includes `addCookieAuth('session')` to mark the auth mechanism.

### Annotated every endpoint with Swagger decorators

- Added `@ApiProperty`/`@ApiPropertyOptional` to all DTOs across `users`, `admins`, `auth`, `exercises` and `routines`.
- Created response DTOs (`UserResponseDto`, `AdminResponseDto`, `LoginResponseDto`, `ExerciseResponseDto`, `RoutineResponseDto`, `RoutineExerciseResponseDto`) to document response schemas.
- Added `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiParam` and `@ApiCookieAuth` to every controller (including the root `AppController` as "Health").

### Added logout endpoint

- Added `POST /auth/logout` in `apps/api/src/auth/auth.controller.ts` — guarded by `JwtAuthGuard`, clears the `session` cookie via `response.clearCookie` and returns a confirmation message.

### Split README by language

- Rewrote `README.md` fully in English (GitHub-facing).
- Created `README.es.md` with the same content in Spanish.
- Both document the Swagger setup, decorators used, and all API endpoints.

### Protected all endpoints with roles

- Made every cookie-protected endpoint require the `admin`/`superadmin` role using `RolesGuard` + `@Roles('admin', 'superadmin')`:
  - Users: all routes
  - Admins: `getAllAdmins` and `getAdmin/:id` (create/update/delete remain `superadmin`-only)
  - Exercises: `getAllExercises` and `getExercise/:id`
  - Routines: `getAllRoutines`
- **Exceptions that stay open to any authenticated user:** `auth/logout` and `routines/getRoutine/:id`.
- Updated both README files with the new role requirements and `403` responses.

---

## Session 4 — 2026-08-31

### Created Memberships + Client Memberships modules

Built both modules in `apps/api/src/` following the 3-layer architecture:

- **Memberships** (`memberships/`) — CRUD plans (name, duration_days, price, is_active).
  - 5 REST endpoints, all admin/superadmin: `GET /memberships/getAllMemberships`, `GET /memberships/getMembership/:id`, `POST /memberships/createMembership`, `PATCH /memberships/updateMembership/:id`, `DELETE /memberships/deleteMembership/:id`.
  - Note: `memberships` table has no `updated_at` column — queries only return `created_at`.
- **Client memberships** (`client-memberships/`) — assign membership plans to clients.
  - Endpoints: `GET /client-memberships/getAllClientMemberships`, `GET /client-memberships/getClientMembership/:id`, `GET /client-memberships/client/:clientId` (all of a client), `POST /client-memberships/createClientMembership`, `PATCH /client-memberships/updateClientMembership/:id`, `DELETE /client-memberships/deleteClientMembership/:id`.
  - `POST` validates client + membership existence, and auto-computes `end_date = start_date + duration_days` when not provided.
- **Cross-module injection** — added `exports: [UsersRepository]` to `UsersModule`; `ClientMembershipsModule` imports `AuthModule`, `UsersModule`, `MembershipsModule` (which exports `MembershipsRepository`).
- Registered both modules in `AppModule`.

### Fixed the whole API lint (175 → 0 problems)

The repo lint was failing with 175 `@typescript-eslint/no-unsafe-*` errors caused by untyped raw-SQL rows (`pg` returns `any[]`), propagated through repositories → services → controllers.

- Created `apps/api/src/database/database.types.ts` with schema-derived row interfaces (ClientRow, AdminRow, ExerciseRow, RoutineRow, RoutineExerciseRow, MembershipRow, ClientMembershipRow + JOIN views and JWT/Auth user types).
- Typed every repository method with `pool.query<T>(...)` and explicit return types (`T | null`, `T[]`, or `Pick<...>` for partial selects).
- Typed the guards/decorators (`JwtUser` in `JwtAuthGuard`, `RolesGuard`, `@User`) and removed `(request as any)` casts.
- Removed unused param `requestingAdminId` from `AdminsService.update`/controller; removed unused imports.
- `bootstrap()` marked `void` in `main.ts` (floating promise).

**Verify:** `npm run build -w apps/api`, `npm run lint -w apps/api`, and `npm test -w apps/api` all pass. Docker image `training-api` used for build/lint since node isn't installed on the host.



---

## Session 5 — 2026-09-16

### Created Payments module

Built the full `payments` module in `apps/api/src/payments/` following the 3-layer architecture:

- **DTOs** — `CreatePaymentDto` (client_id, client_membership_id?, amount, payment_date, due_date, method, status?) and `UpdatePaymentDto` (all optional). `method` matches `cash|card|transfer`, `status` matches `paid|pending|overdue` (default `pending`).
- **Repository** — Raw SQL via `pg.Pool`:
  - findAll / findById / findByClientId with LEFT JOINs on `client_memberships` + `memberships` to expose `client_name` and `membership_name` (`PaymentView`).
  - create (default status `pending`), updateById (dynamic fields + `updated_at = NOW()`), deleteById.
- **Service** — Validates the **client** exists (via `UsersRepository`) and, when provided, the **client_membership** exists (via `ClientMembershipsRepository`); NotFoundException handling.
- **Controller** — 6 REST endpoints, all admin/superadmin:
  - `GET /payments/getAllPayments`, `GET /payments/getPayment/:id`, `GET /payments/client/:clientId`, `POST /payments/createPayment`, `PATCH /payments/updatePayment/:id`, `DELETE /payments/deletePayment/:id`.
- **Module** — Registered `PaymentsModule` in `AppModule`. Added `exports: [ClientMembershipsRepository]` to `ClientMembershipsModule` to allow cross-module injection.
- **Types** — Added `PaymentRow` and `PaymentView` to `apps/api/src/database/database.types.ts`.
- **Documentation** — Updated `TODO.md`, `DIARY.md`, and the README endpoint tables.

**Schema reference:** `database/schema.sql` — payments (id, client_id FK, client_membership_id FK nullable, amount DECIMAL, payment_date, due_date, method CHECK, status CHECK default 'pending').

**Verify:** `npm run build`, `npm run lint`, and `npm test` all pass via Docker image `training-api`.


### Created Client Routines module

Built the full `client-routines` module in `apps/api/src/client-routines/` following the 3-layer architecture:

- **DTOs** — `CreateClientRoutineDto` (client_id, routine_id, start_date, end_date?, is_active?) and `UpdateClientRoutineDto` (start_date?, end_date?, is_active?).
- **Repository** — Raw SQL via `pg.Pool`:
  - findAll / findById / findByClientId / findByRoutineId with JOINs on `clients` + `routines` to expose `client_name` and `routine_name` (`ClientRoutineView`).
  - create (default `is_active` true), updateById (dynamic fields + `updated_at = NOW()`), deleteById.
- **Service** — Validates the **client** exists (via `UsersRepository`) and the **routine** exists (via `RoutinesRepository`); NotFoundException handling.
- **Controller** — 7 REST endpoints, all admin/superadmin:
  - `GET /client-routines/getAllClientRoutines`, `GET /client-routines/getClientRoutine/:id`, `GET /client-routines/client/:clientId`, `GET /client-routines/routine/:routineId`, `POST /client-routines/createClientRoutine`, `PATCH /client-routines/updateClientRoutine/:id`, `DELETE /client-routines/deleteClientRoutine/:id`.
  - `POST /createClientRoutine` extracts `assigned_by` from the JWT via `@User('sub')`.
- **Module** — Registered `ClientRoutinesModule` in `AppModule`. Added `exports: [RoutinesRepository]` to `RoutinesModule` for cross-module injection.
- **Types** — Added `ClientRoutineRow` and `ClientRoutineView` to `apps/api/src/database/database.types.ts`.
- **Documentation** — Updated `TODO.md`, `DIARY.md`, and the README endpoint tables.

**Schema reference:** `database/schema.sql` — client_routines (id, client_id FK, routine_id FK, assigned_by FK, start_date, end_date, is_active, UNIQUE(client_id, routine_id, start_date)).

**Verify:** `npm run build`, `npm run lint`, and `npm test` all pass via Docker image `training-api`.


### Fixed client-routines auth: clients can now view their own routines

Bug found: `GET /client-routines/getClientRoutine/:id` and `GET /client-routines/client/:clientId` required the `admin`/`superadmin` role, so a client could never see their own assigned routine (contradicting the existing `routines` module, where `GET /routines/getRoutine/:id` is open to any authenticated user).

Changes:
- `GET /client-routines/getClientRoutine/:id` → `@UseGuards(JwtAuthGuard)` only (any logged-in user), mirroring `GET /routines/getRoutine/:id`.
- `GET /client-routines/client/:clientId` → now also accepts the `client` role via `@Roles('admin', 'superadmin', 'client')`, with an inline ownership check in the service (`client-routines.service.ts`): if `requestingUser.type === 'client'` and `requestingUser.sub !== clientId` → `403 ForbiddenException`. Admins/superadmins can still view any client. Uses the existing inline-check pattern from `admins.service.ts` (`Cannot delete yourself`).
- Typed the controller param with `import type { JwtUser }` to satisfy `isolatedModules`/`emitDecoratorMetadata`.
- Updated READMEs and TODO.md.

**Verify:** `npm run build`, `npm run lint`, `npm test` pass via Docker image `training-api`.
