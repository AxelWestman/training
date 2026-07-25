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

## API Endpoints — Users

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `POST` | `/users/createUser` | Crea un nuevo usuario | `201` creado · `409` email/DNI duplicado |
| `GET` | `/users/getAllUsers` | Obtiene todos los usuarios | `200` array de usuarios |
| `GET` | `/users/getUser/:id` | Obtiene un usuario por ID | `200` usuario · `404` no encontrado |
| `PATCH` | `/users/activateUser/:id` | Activa un usuario (`is_active = true`) | `200` usuario activado · `404` no encontrado |
| `PATCH` | `/users/deactivateUser/:id` | Desactiva un usuario (`is_active = false`) | `200` usuario desactivado · `404` no encontrado |
| `DELETE` | `/users/deleteUser/:id` | Elimina un usuario | `200` usuario eliminado · `404` no encontrado |

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

El login busca el email primero en `admins`, luego en `clients`. Si las credenciales son válidas, firma un JWT (payload: `sub`, `email`, `type`, `role`) y lo devuelve en una cookie httpOnly con expiración de 24h.

## API Endpoints — Admins

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `GET` | `/admins/getAllAdmins` | Obtiene todos los admins | `200` array de admins · `401` no autenticado |
| `GET` | `/admins/getAdmin/:id` | Obtiene un admin por ID | `200` admin · `401` no autenticado · `404` no encontrado |
| `POST` | `/admins/createAdmin` | Crea un admin o superadmin (solo superadmin) | `201` admin creado · `401` no autenticado · `403` no es superadmin · `409` email/DNI duplicado |
| `PATCH` | `/admins/updateAdmin/:id` | Actualiza un admin (solo superadmin) | `200` admin actualizado · `401` no autenticado · `403` no es superadmin · `404` no encontrado |
| `DELETE` | `/admins/deleteAdmin/:id` | Elimina un admin (solo superadmin, no a sí mismo) | `200` admin eliminado · `401` no autenticado · `403` no es superadmin · `404` no encontrado |

- `GET /getAllAdmins` y `GET /getAdmin/:id` requieren solo autenticación (cualquier usuario logueado).
- `POST /createAdmin`, `PATCH /updateAdmin/:id` y `DELETE /deleteAdmin/:id` requieren rol **superadmin**.
- `DELETE /deleteAdmin/:id` no permite eliminarse a sí mismo (responde `403`).
- El campo `role` es opcional (default `admin`). Valores permitidos: `admin` | `superadmin`.

## API Endpoints — Exercises

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| `GET` | `/exercises/getAllExercises` | Obtiene todos los ejercicios | `200` array de ejercicios · `401` no autenticado |
| `GET` | `/exercises/getExercise/:id` | Obtiene un ejercicio por ID | `200` ejercicio · `401` no autenticado · `404` no encontrado |
| `POST` | `/exercises/createExercise` | Crea un nuevo ejercicio | `201` ejercicio creado · `401` no autenticado · `403` permisos insuficientes |
| `PATCH` | `/exercises/updateExercise/:id` | Actualiza un ejercicio | `200` ejercicio actualizado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |
| `DELETE` | `/exercises/deleteExercise/:id` | Elimina un ejercicio (responde `{ "message": "The exercise <name> was deleted" }`) | `200` ejercicio eliminado · `401` no autenticado · `403` permisos insuficientes · `404` no encontrado |

- `GET` requiere solo autenticación (cualquier usuario logueado).
- `POST`, `PATCH` y `DELETE` requieren rol **admin** o **superadmin**.

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

<｜｜DSML｜｜parameter name="description" string="true">Add architecture docs to README
