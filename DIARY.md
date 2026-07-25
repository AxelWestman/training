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


