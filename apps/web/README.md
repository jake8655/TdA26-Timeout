# Tour de App - Timeout Frontend

## Getting Started

1. Install [Node.js v22](https://nodejs.org/en/download).
1. Install [bun](https://bun.com).
1. Run `bun install` to install the dependencies.
1. Run `bun openapi:generate` to generate the OpenAPI client.
1. Run `bun dev` to start the development server.
1. Open [http://localhost:3001](http://localhost:3001) to see the result.

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Next.js](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/docs)
- [Motion.dev](https://motion.dev/)

## Editor Setup

I recommend using [VSCode](https://code.visualstudio.com/) with the following extensions:

- [Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) - linter, formatter, and code action tool.
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

Make sure format on save is enabled in your editor settings to automatically format your code with Biome.

## Deployment

The application is deployed using [Docker](https://docker.com) to [TdA Cloud](https://tourde.cloud). Pushes to the `main` branch trigger (semi-)automatic deployments.
Make sure biome and typescript checks pass before opening a PR.
You can check them with:

```bash
bun fmt
bun lint
bun types
```
