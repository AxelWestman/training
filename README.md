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

### Seguridad

- Las contraseñas se hashean con **bcrypt**.

<｜｜DSML｜｜parameter name="description" string="true">Add architecture docs to README
