# MUST
- Use bun and bunx instead of npm and npx
- Use the package.json scripts to format/fix/lint/build/typecheck...
  - bun check to check formatting
  - bun check:write to fix formatting
  - bun check:unsafe to fix formatting with unsafe rules
  - bun types to typecheck
- DO NOT manually format code/sort imports/remove unused imports, use the scripts above
- DO NOT stage, commit, push code or open PRs, I will handle that
- DO NOT run the dev server or any interactive commands, I will handle that
- Use kebab-case for file and folder names

## UI
- Use Tailwind CSS for styling
- Dark mode only (no light mode needed)
- Prefer using components from src/components/ui or add new ones using the shadcn tool over creating custom components
- Almost never use vanilla inputs/buttons/selects/modals/toasts/accordions/tabs, always use the shadcn equivalents
- Make sure your designs are responsive and work well on different screen sizes
- Make the UIs fancy and visually appealing and use motion.dev for animations
- use tanstack query for data fetching and caching
- use tanstack query mutations for data modifications (all queries are invalidated after each mutation so don't worry about cache updates)
- use the generated api-client to interact with the backend instead of calling the endpoints directly
- DO NOT create separate types/interfaces for React component props, use inline types instead
