FROM eclipse-temurin:17-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS builder
WORKDIR /app
COPY . .
RUN ./gradlew build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 java && \
    adduser --system --uid 1001 spring

COPY --from=builder --chown=spring:java /app/build/libs/*.jar ./app.jar

USER spring

EXPOSE 3000

CMD ["java", "-jar", "app.jar"]
