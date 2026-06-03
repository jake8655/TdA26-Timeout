FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew build

FROM eclipse-temurin:17-jre-jammy AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 java && \
    adduser --system --uid 1001 --ingroup java spring

COPY --from=builder --chown=spring:java /app/build/libs/*.jar ./app.jar

RUN mkdir -p /app/uploads && chown spring:java /app/uploads
ENV UPLOADS_DIR=/app/uploads

USER spring

EXPOSE 3000

CMD ["java", "-jar", "app.jar"]
