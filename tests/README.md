# Tests

This directory contains tests for the Tour de App 2026 project.

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Install Playwright browsers:
   ```bash
   bunx playwright install chromium
   ```

3. Generate types from OpenAPI schema:
   ```bash
   bun run generate-types
   ```

4. Create `.env` file (see `.env.example`):
   ```bash
   cp .env.example .env
   # Edit .env to set RUN_URL if needed (default: http://localhost:3000)
   ```

5. Start backend (and optionally frontend):
   ```bash
   # Option 1: Start backend only
   cd apps/server && just run

   # Option 2: Start with Docker Compose
   docker compose up -d
   ```

## Running Tests

### Run all tests (watch mode)
```bash
bun run test
```

### Run all tests once
```bash
bun run test:run
```

### Run specific phase
```bash
# Run only phase 2
TEST_PHASE=2 bun run test

# Run phases 0-2
TEST_PHASE=0:2 bun run test

# Run only phase 3
TEST_PHASE=3:3 bun run test
```

### Run tests in CI mode (single run)
```bash
bun run test:run
```

## Phase Filtering

The `TEST_PHASE` environment variable controls which phases to run:

- `TEST_PHASE=0` - Run phases 0
- `TEST_PHASE=2` - Run phases 0-2
- `TEST_PHASE=2:4` - Run phases 2-4
- `TEST_PHASE=2:2` - Run only phase 2
- (unset) - Run all phases

## Type Generation

Types are automatically generated from `../apps/web/server-schema.yml` using `openapi-typescript`.

If you modify the schema, regenerate types:
```bash
bun run generate-types
```

## Directory Structure

- `upstream/` - Test files for each phase (0-4)
- `generated/` - Auto-generated types from OpenAPI schema
- `phase-utils.ts` - Test utilities (api helpers, phase filtering, page testing)
- `package.json` - Test dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Vitest configuration

## CI/CD

Tests are automatically run in GitHub Actions when:
- Push to `main` branch
- Pull requests to any branch

The CI workflow:
1. Builds and starts services with Docker Compose
2. Waits for backend/frontend to be ready
3. Installs test dependencies
4. Runs all phases of tests
5. Cleans up containers

See `.github/workflows/tests-ci.yml` for details.
