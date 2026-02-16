FROM eclipse-temurin:17-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 java && \
    adduser --system --uid 1001 spring

COPY --from=builder --chown=spring:java /app/build/libs/*.jar ./app.jar

RUN mkdir -p /app/uploads && chown spring:java /app/uploads
ENV UPLOADS_DIR=/app/uploads

USER spring

EXPOSE 3000

ENV DBUSERNAME=${DBUSERNAME}
ENV DBPASSWORD=${DBPASSWORD}
ENV DBURL=${DBURL}

CMD ["java", "-jar", "app.jar"]
