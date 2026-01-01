# Tour de App - Timeout Backend

## Getting Started

1. Install [OpenJDK 17](https://bell-sw.com/pages/downloads/#jdk-17-lts).
1. Install [just](https://github.com/casey/just#installation).
1. Run `just build` to build the app.
1. Run `just run` to start the server.
1. Open [http://localhost:3000](http://localhost:3000) to see the result.

## Tech Stack

- [Java](https://dev.java/learn/)
- [Spring](https://spring.io/quickstart)
- [MySQL](https://dev.mysql.com/doc/mysql-tutorial-excerpt/8.0/en/)

## Editor Setup

Probably [IntelliJ IDEA](https://www.jetbrains.com/idea/download/).

## Deployment

The application is deployed using [Docker](https://docker.com) to [TdA Cloud](https://tourde.cloud). Pushes to the `main` branch trigger (semi-)automatic deployments.

### Phase 0
- [x] root endpoint
### Phase 1
- [ ] login (for now hardcoded user)
- [ ] list of courses
- [ ] course details
- [ ] admin dashboard
  - [ ] add course (max 30mb)
  - [ ] remove course
  - [ ] update course
  - [ ] log out
###
- [ ] register
