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


