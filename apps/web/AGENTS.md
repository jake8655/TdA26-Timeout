# MUST
- Use bun and bunx instead of npm and npx
- Use the package.json scripts to format/fix/lint/build/typecheck...
  - bun check to check formatting
  - bun check:write to fix formatting
  - bun check:unsafe to fix formatting with unsafe rules
  - bun types to typecheck
- DO NOT manually format code

## UI
- Use Tailwind CSS for styling
- Dark mode only (no light mode needed)
- Prefer using components from src/components/ui or add new ones using shadcn over creating custom components
- Make sure your designs are responsive and work well on different screen sizes
- Make the UIs fancy and visually appealing and use motion.dev for animations
- use tanstack query for data fetching and caching
- use tanstack query mutations for data modifications (all queries are invalidated after each mutation so don't worry about cache updates)
- use the generated api-client to interact with the backend instead of calling the endpoints directly
