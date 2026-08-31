# Monorepo Gimnasio

Monorepo con **NestJS** (backend), **Next.js** (frontend) y **PostgreSQL**.

## Estructura

```
├── apps/
│   ├── api/          # NestJS - Backend (puerto 3001)
│   └── web/          # Next.js - Frontend (puerto 3000)
├── packages/         # Paquetes compartidos (opcional)
├── docker-compose.yml
└── package.json      # npm workspaces raíz
```

## Requisitos

- Node.js >= 20
- npm
- Docker (opcional, para contenedores)

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
# Backend con hot-reload
npm run dev:api

# Frontend con hot-reload
npm run dev:web
```

Variables de entorno en `.env`.

## Build

```bash
npm run build
```

## Docker

```bash
# Levantar todos los servicios (PostgreSQL + API + Web)
docker compose up -d

# Desarrollo con hot-reload (sincroniza cambios en vivo)
docker compose up --watch

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

> `docker compose up --watch` usa los `Dockerfile.dev` de cada app y sincroniza automáticamente los cambios del código fuente al contenedor. El backend se recarga con `nest start --watch` y el frontend con `next dev` (incluye HMR).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:api` | Inicia NestJS en modo watch |
| `npm run dev:web` | Inicia Next.js en modo dev |
| `npm run build:api` | Build del backend |
| `npm run build:web` | Build del frontend |
| `npm run build` | Build de todo el monorepo |
| `npm run lint` | Lintea ambos proyectos |

## Arquitectura del backend

El backend sigue una arquitectura en 3 capas:

```
Controller → Service → Repository → Database (PostgreSQL vía pg)
```

| Capa | Responsabilidad |
|------|----------------|
| **Controller** | Maneja rutas HTTP, validación de entrada (DTOs con `class-validator`) |
| **Service**   | Lógica de negocio, orquestación, validaciones de dominio |
| **Repository** | Acceso a datos, consultas SQL (sin ORM, usando `pg.Pool`) |

Actualmente el módulo `users` implementa este patrón. Las nuevas funcionalidades deben seguir la misma estructura.

## Documentación de la API (Swagger)

La API expone una documentación interactiva con **Swagger UI** en:

```
http://localhost:3001/docs
```

Se configura en `apps/api/src/main.ts` mediante `@nestjs/swagger`:

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

Desde Swagger UI se pueden explorar y probar los endpoints (botón **Try it out**), ver los esquemas de request/response y autenticarse con la cookie `session`.

### Decoradores usados

| Decorador | Uso |
|-----------|-----|
| `@ApiTags('Exercises')` | Agrupa los endpoints de un controlador bajo una sección |
| `@ApiOperation({ summary })` | Añade un resumen/descripción por endpoint |
| `@ApiResponse({ status, description, type })` | Documenta códigos de respuesta y su esquema |
| `@ApiParam({ name, example })` | Documenta parámetros de ruta |
| `@ApiProperty({ example })` | Describe campos de un DTO de entrada |
| `@ApiPropertyOptional()` | Describe campos opcionales |
| `@ApiCookieAuth('session')` | Marca el endpoint como protegido por la cookie de sesión |

Los DTOs de respuesta (ej. `ExerciseResponseDto`, `UserResponseDto`) definen el esquema que Swagger muestra para cada endpoint.

## API Endpoints — Users

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `POST` | `/users/createUser` | Crea un nuevo usuario | `201` creado · `401` no autenticado · `403` permisos insuficientes · `409` email/DNI duplicado |
| `GET` | `/users/getAllUsers` | Obtiene todos los usuarios | `200` array de usuarios · `401` no autenticado · `403` permisos insuficientes |
| `GET` | `/users/getUser/:id` | Obtiene un usuario por ID | `200` usuario · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `PATCH` | `/users/activateUser/:id` | Activa un usuario (`is_active = true`) | `200` usuario activado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `PATCH` | `/users/deactivateUser/:id` | Desactiva un usuario (`is_active = false`) | `200` usuario desactivado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `DELETE` | `/users/deleteUser/:id` | Elimina un usuario | `200` usuario eliminado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |

Todos los endpoints de usuarios requieren rol **admin** o **superadmin**.

### Validaciones

- `POST /users/createUser` verifica que el **email** y el **DNI** no existan antes de crear:
  - Email duplicado → `409 Conflict` — `"Email already exists"`
  - DNI duplicado → `409 Conflict` — `"DNI already exists"`
- Las columnas `email` y `dni` tienen restricciones `UNIQUE` en la base de datos como respaldo.
- El parámetro `:id` se valida con `ParseIntPipe` — si no es un número entero responde `400 Bad Request`.

## API Endpoints — Auth

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `POST` | `/auth/login` | Inicia sesión (admins y clients). Setea cookie `session` httpOnly con JWT | `201` usuario · `401` credenciales inválidas |
| `POST` | `/auth/logout` | Cierra sesión y elimina la cookie `session` | `200` sesión cerrada · `401` no autenticado |

El login busca el email primero en `admins`, luego en `clients`. Si las credenciales son válidas, firma un JWT (payload: `sub`, `email`, `type`, `role`) y lo devuelve en una cookie httpOnly con expiración de 24h. El logout requiere autenticación y elimina la cookie `session`.

## API Endpoints — Admins

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `GET` | `/admins/getAllAdmins` | Obtiene todos los admins | `200` array de admins · `401` no autenticado · `403` permisos insuficientes |
| `GET` | `/admins/getAdmin/:id` | Obtiene un admin por ID | `200` admin · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `POST` | `/admins/createAdmin` | Crea un admin o superadmin (solo superadmin) | `201` admin creado · `401` no autenticado · `403` no es superadmin · `409` email/DNI duplicado |
| `PATCH` | `/admins/updateAdmin/:id` | Actualiza un admin (solo superadmin) | `200` admin actualizado · `401` no autenticado · `403` no es superadmin · `404` no encontrado |
| `DELETE` | `/admins/deleteAdmin/:id` | Elimina un admin (solo superadmin, no a sí mismo) | `200` admin eliminado · `401` no autenticado · `403` no es superadmin · `404` no encontrado |

- `GET /getAllAdmins` y `GET /getAdmin/:id` requieren rol **admin** o **superadmin**.
- `POST /createAdmin`, `PATCH /updateAdmin/:id` y `DELETE /deleteAdmin/:id` requieren rol **superadmin**.
- `DELETE /deleteAdmin/:id` no permite eliminarse a sí mismo (responde `403`).
- El campo `role` es opcional (default `admin`). Valores permitidos: `admin` | `superadmin`.

## API Endpoints — Exercises

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `GET` | `/exercises/getAllExercises` | Obtiene todos los ejercicios | `200` array de ejercicios · `401` no autenticado · `403` permisos insuficientes |
| `GET` | `/exercises/getExercise/:id` | Obtiene un ejercicio por ID | `200` ejercicio · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `POST` | `/exercises/createExercise` | Crea un nuevo ejercicio | `201` ejercicio creado · `401` no autenticado · `403` permisos insuficientes |
| `PATCH` | `/exercises/updateExercise/:id` | Actualiza un ejercicio | `200` ejercicio actualizado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `DELETE` | `/exercises/deleteExercise/:id` | Elimina un ejercicio (responde `{ "message": "The exercise <name> was deleted" }`) | `200` ejercicio eliminado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |

- Todos los endpoints requieren rol **admin** o **superadmin**.

## API Endpoints — Routines

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `GET` | `/routines/getAllRoutines` | Obtiene todas las rutinas con sus ejercicios | `200` array de rutinas · `401` no autenticado · `403` permisos insuficientes |
| `GET` | `/routines/getRoutine/:id` | Obtiene una rutina por ID con sus ejercicios | `200` rutina · `401` no autenticado · `404` no encontrado |
| `POST` | `/routines/createRoutine` | Crea una rutina (opcionalmente con ejercicios) | `201` rutina creada · `401` no autenticado · `403` permisos insuficientes · `404` ejercicio no encontrado |
| `PATCH` | `/routines/updateRoutine/:id` | Actualiza los detalles de una rutina | `200` rutina actualizada · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `DELETE` | `/routines/deleteRoutine/:id` | Elimina una rutina y sus ejercicios asociados (CASCADE) | `200` rutina eliminada · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `POST` | `/routines/:id/addExercise` | Añade un ejercicio a una rutina | `201` ejercicio añadido · `401` no autenticado · `403` permisos insuficientes · `404` rutina/ejercicio no encontrado |
| `PATCH` | `/routines/:id/updateExercise/:exerciseId` | Actualiza los parámetros de un ejercicio dentro de una rutina | `200` ejercicio actualizado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `DELETE` | `/routines/:id/removeExercise/:exerciseId` | Elimina un ejercicio de una rutina | `200` ejercicio eliminado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |

- `GET /getRoutine/:id` requiere solo autenticación (cualquier usuario logueado puede ver una rutina).
- El resto de endpoints (`GET /getAllRoutines`, `POST`, `PATCH` y `DELETE`) requieren rol **admin** o **superadmin**.
- El campo `created_by` de la rutina se asigna automáticamente a partir del admin autenticado (extraído del JWT).

### Request bodies (DTOs)

**POST /routines/createRoutine** — `CreateRoutineDto`
```json
{
  "name": "Push / Pull / Legs",
  "description": "Rutina PPL de 3 días (opcional)",
  "exercises": [
    {
      "exercise_id": 1,
      "day_of_week": 1,
      "sets": 4,
      "reps": 10,
      "rest_time": 90,
      "order": 1,
      "notes": "Aumentar el peso progresivamente"
    }
  ]
}
```

- `exercises` es un array opcional. Cada elemento (`CreateRoutineExerciseDto`) requiere:
  - `exercise_id` (int) — ID de un ejercicio existente
  - `day_of_week` (int, 1–7) — Día de la semana
  - `sets` (int, >= 1) — Número de series
  - `reps` (int, >= 1) — Número de repeticiones
  - `order` (int, >= 0) — Orden dentro del día
  - `rest_time` (int, opcional) — Tiempo de descanso en segundos
  - `notes` (string, opcional) — Notas adicionales

**PATCH /routines/updateRoutine/:id** — `UpdateRoutineDto`
```json
{
  "name": "Nuevo nombre",
  "description": "Nueva descripción",
  "is_active": false
}
```
Todos los campos son opcionales.

**PATCH /routines/:id/updateExercise/:exerciseId** — `UpdateRoutineExerciseDto`
```json
{
  "day_of_week": 2,
  "sets": 5,
  "reps": 8,
  "rest_time": 120,
  "order": 2,
  "notes": "Actualizado"
}
```
Todos los campos son opcionales.

### Tablas usadas

| Tabla | Propósito |
|-------|-----------|
| `routines` | Datos principales de la rutina (`name`, `description`, `created_by`, `is_active`) |
| `routine_exercises` | Asignación de ejercicios a rutinas con parámetros (`day_of_week`, `sets`, `reps`, `rest_time`, `order`, `notes`) |
| `exercises` | Catálogo de ejercicios (JOIN para obtener `exercise_name`, `muscle_group`, `equipment`) |

## API Endpoints — Memberships

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `GET` | `/memberships/getAllMemberships` | Obtiene todos los planes de membresía | `200` array de planes · `401` no autenticado · `403` permisos insuficientes |
| `GET` | `/memberships/getMembership/:id` | Obtiene un plan de membresía por ID | `200` plan · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `POST` | `/memberships/createMembership` | Crea un plan de membresía | `201` plan creado · `400` error de validación · `401` no autenticado · `403` permisos insuficientes |
| `PATCH` | `/memberships/updateMembership/:id` | Actualiza un plan de membresía | `200` plan actualizado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `DELETE` | `/memberships/deleteMembership/:id` | Elimina un plan de membresía (responde `{ "message": "The membership <name> was deleted" }`) | `200` plan eliminado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |

- Todos los endpoints requieren rol **admin** o **superadmin**.

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

- `name` (string, requerido) — Nombre del plan
- `duration_days` (int, >= 1, requerido) — Duración en días
- `price` (number, >= 0, requerido) — Precio
- `is_active` (boolean, opcional, default `true`) — Si el plan está activo

**PATCH /memberships/updateMembership/:id** — `UpdateMembershipDto`. Todos los campos son opcionales.

### Tabla usada

| Tabla | Propósito |
|-------|-----------|
| `memberships` | Planes de membresía (`name`, `duration_days`, `price`, `is_active`) |

## API Endpoints — Client Memberships

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `GET` | `/client-memberships/getAllClientMemberships` | Obtiene todas las membresías de clientes (con nombres de cliente y plan) | `200` array · `401` no autenticado · `403` permisos insuficientes |
| `GET` | `/client-memberships/getClientMembership/:id` | Obtiene una membresía de cliente por ID | `200` registro · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `GET` | `/client-memberships/client/:clientId` | Obtiene todas las membresías de un cliente | `200` array · `401` no autenticado · `403` permisos insuficientes · `404` cliente no encontrado |
| `POST` | `/client-memberships/createClientMembership` | Asigna un plan de membresía a un cliente | `201` registro creado · `400` error de validación · `401` no autenticado · `403` permisos insuficientes · `404` cliente/plan no encontrado |
| `PATCH` | `/client-memberships/updateClientMembership/:id` | Actualiza fechas o estado | `200` registro actualizado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `DELETE` | `/client-memberships/deleteClientMembership/:id` | Elimina una membresía de cliente | `200` registro eliminado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |

- Todos los endpoints requieren rol **admin** o **superadmin**.
- `POST /createClientMembership` valida que el **cliente** y el **plan de membresía** existan. Si no se envía `end_date`, se calcula automáticamente como `start_date + duration_days` del plan.
- Valores permitidos de `status`: `active` | `expired` | `cancelled` (default `active`).

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

- `client_id` (int, requerido) — ID de un cliente existente
- `membership_id` (int, requerido) — ID de un plan de membresía existente
- `start_date` (fecha `YYYY-MM-DD`, requerido) — Fecha de inicio
- `end_date` (fecha, opcional) — Fecha de fin (default `start_date + duration_days`)
- `status` (string, opcional) — `active` | `expired` | `cancelled`

**PATCH /client-memberships/updateClientMembership/:id** — `UpdateClientMembershipDto` (`start_date`, `end_date`, `status`, todos opcionales).

### Tablas usadas

| Tabla | Propósito |
|-------|-----------|
| `client_memberships` | Asignación de un plan de membresía a un cliente (`client_id`, `membership_id`, `start_date`, `end_date`, `status`) |
| `clients` | Datos del cliente (JOIN para `client_name`) |
| `memberships` | Datos del plan (JOIN para `membership_name` y para calcular `end_date`) |

### Guards

| Guard | Uso |
|-------|-----|
| `JwtAuthGuard` | Verifica que exista una cookie `session` válida |
| `RolesGuard` | Restringe según el rol del usuario. Se usa con el decorador `@Roles()` |

```typescript
@UseGuards(JwtAuthGuard)                            // cualquier usuario logueado
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')                       // solo admins (admin o superadmin)
@Roles('superadmin')                                // solo superadmins
```

### Seguridad

- Las contraseñas se hashean con **bcrypt** (salt rounds = 10) antes de almacenarse tanto en `clients.password` como en `admins.password_hash`.
- El login firma un **JWT** guardado en cookie **httpOnly** (no accesible desde JavaScript) con `sameSite: 'lax'` y expiración de 24h.
- Los guards pueden aplicarse a cualquier endpoint para validar la sesión y el rol antes de ejecutar la lógica.
