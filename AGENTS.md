# AGENTS.md

Gym management SaaS: admin panel for managing members, memberships, exercises, workout routines, payments, and attendance. Monorepo with NestJS API + Next.js web + PostgreSQL.

## Commands

```bash
npm run dev:api        # NestJS --watch (port 3001)
npm run dev:web        # Next.js dev (port 3000)
npm run build          # Build both apps
npm run lint           # Lint both apps
npm run test -w apps/api          # API unit tests
npm run test:e2e -w apps/api      # API e2e tests
```

Workspace manager is **npm workspaces**, not pnpm/yarn/turbo/nx. Prefix workspace commands with `-w apps/api` or `-w apps/web`.

## Architecture: no ORM

The API uses **raw SQL via `pg.Pool`** (no TypeORM, no Prisma). Every module follows:

```
Controller → Service → Repository (handwritten SQL)
```

Each domain is a NestJS module under `apps/api/src/<domain>/`. Usually 5 files:
`<domain>.module.ts`, `.controller.ts`, `.service.ts`, `.repository.ts`, `dto/<domain>.dto.ts`.

## Key conventions

- **Schema is gitignored** — `database/schema.sql` does NOT exist in the repo. Use the README or existing module queries as reference.
- **Cross-module injection** — when importing another module's repository (e.g. `ExercisesRepository` in `RoutinesService`), the source module must `exports: [...]` its repository.
- **`ConfigModule.forRoot({ ignoreEnvFile: true })`** — NestJS reads env vars at runtime, not from `.env`. Local dev must set env vars explicitly or via docker-compose.
- **JWT auth** — cookie `session` (httpOnly, sameSite:lax, 24h). Use `@UseGuards(JwtAuthGuard)` for auth, `@Roles('admin','superadmin')` for role check. Extract user with `@User('sub')` decorator.
- **Passwords** — bcrypt, 10 salt rounds.
- **Validation** — `class-validator` decorators on DTOs.
- **DB style** — tables/columns use `snake_case`; TypeScript properties use `camelCase`.
- **Prettier** — config only in `apps/api/.prettierrc`: `singleQuote: true`, `trailingComma: "all"`.

## Testing

- Jest 30, configured inline in `apps/api/package.json` (not a separate `jest.config.*`).
- Unit tests: `*.spec.ts` in `src/`. E2E: `*.e2e-spec.ts` in `test/`.
- Web app has no tests configured.

## Docker

```bash
docker compose up -d         # postgres + api + web
docker compose up --watch    # hot-reload dev mode
```

## No CI, no pre-commit hooks

No GitHub workflows, no husky, no lint-staged. Run `npm run lint` manually before commits.
