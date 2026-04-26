# Tour de App - Timeout (Grandfinale)
An online course platform for educators and learners alike.

## Team Members
- [Dominik Tóth (Jake)](https://github.com/jake8655) - frontend, team lead
- [Filip Konc (hypnomacka)](https://github.com/hypnomacka) - backend
- [Jakub Cagáň](https://github.com/koobisko) - pani sekretarka + financial support

## Quick Start (Docker Compose)

```bash
docker compose up --build          # Start all services
docker compose down                # Stop all services
docker compose down -v             # Stop and delete DB data
```

Open [http://localhost](http://localhost).

## Individual Services

See `apps/server/README.md` and `apps/web/README.md` for running services independently.

## Tech Stack
- Frontend: Next.js, TypeScript, React, Tailwind CSS, Tanstack
- Backend: Java, Spring Boot, eBean ORM
- Database: MySQL 8.0
- Infra: Docker, TdA Cloud
- Deploy time: 3mins
