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
