# Tour de App - Timeout Backend

## Prerequisites
- [OpenJDK 17](https://bell-sw.com/pages/downloads/#jdk-17-lts)
- [just](https://github.com/casey/just#installation)

## Commands

| Command | Description |
|---------|-------------|
| `just build` | Build the app |
| `just run` | Start the server (requires DB running) |
| `just db` | Start MySQL container on localhost:3306 |
| `just db-stop` | Stop and remove MySQL container |

## Development Workflow

```bash
just db           # Start database
just build        # Build the app
just run          # Run the server
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack
- Java 17, Spring Boot, eBean ORM, MySQL 8.0

## Editor
[IntelliJ IDEA](https://www.jetbrains.com/idea/download/)

## Deployment
~Deployed via Docker to [TdA Cloud](https://tourde.cloud). Pushes to `main` trigger deployments.~
Now deployed to a VM.
