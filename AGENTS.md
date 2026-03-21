# MUST
- Be concise, use bullet points and sacrifice grammar for clarity

## Git
- Do not stage, commit, open PRs unless explicitly asked to
- When asked to commit, use conventional commits with an optional short body and perform small atomic commits
- When opening PRs, look at previous PRs for examples of good PR titles and descriptions
- Prefer writing why and what over how in commit messages and PR descriptions, the code should show how
- Do not mention files, functions, variable names in commit messages or PR descriptions, focus on the intent and impact of the change

## Project Structure
- `apps/web` - Next.js 16 frontend (React 19, TypeScript, Tailwind)
- `apps/server` - Spring Boot backend (Java 17, Ebean ORM)
- `tests` - E2E tests (Vitest + Playwright), do not look into them, modify them, touch them at all, do not run them

---

## Web (apps/web)

### Commands
```bash
bun run build        # Production build
bun fmt              # Format
bun lint             # Auto-fix lint
bun types            # Typecheck
bun openapi:generate # Generate API client from OpenAPI spec
```

### Code Style
- Use bun/bunx instead of npm/npx
- DO NOT manually format/sort imports - use oxfmt/oxlint scripts
- Tabs for indentation, double quotes
- Kebab-case for file/folder names
- Prefer implicit return types (explicit only for complex types)
- Inline types for React component props (no separate interfaces)

### UI/UX
- Tailwind CSS only
- Dark mode only (no light mode)
- Use shadcn components from `src/components/ui/` (never vanilla inputs/buttons/etc)
- Use motion.dev for animations
- Responsive designs

### Data Fetching
- TanStack Query for data fetching/caching
- Use generated API client from `@/api-client` (never direct fetch)
- Mutations auto-invalidate queries

---

## Server (apps/server)

### Commands
```bash
./gradlew build      # Build
just build           # Same via justfile
just run             # Run with dev profile
just db              # Start MySQL container
./google-java-format -n $(find ./src -name "*.java")  # Format check, outputs filenames that are not formatted
./google-java-format -i $(find ./src -name "*.java")  # Fix formatting
./gradlew generateMigration  # Generate DB migration sql file, never manually write migration files, always generate them from entity changes
```

### Code Style
- Java 17, Spring Boot 3.4
- Lombok (@Getter, @Setter) on entities
- Ebean ORM for database
- Google Java Format for formatting
- Controllers extend `Controller` base class
- Entities in `core/` package, controllers in `controllers/`

---

## Common Patterns

### Import Order (handled by oxfmt)
1. External packages
2. Internal aliases (`@/`)
3. Relative imports

### Error Handling
- Frontend: Use toast notifications via sonner
- Backend: Return `ResponseEntity.status(HttpStatus.XXX).body(Map.of("status", "bad", "message", "..."))`

### Naming
- Files: kebab-case
- Components: PascalCase
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
