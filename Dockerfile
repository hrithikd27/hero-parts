# Root-level Dockerfile — build context is the repo root (used by Render).
# hero-parts-platform/Dockerfile is the Cloud Run variant (context = hero-parts-platform/).

# ── Build stage ────────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY hero-parts-platform/pom.xml .
RUN mvn dependency:go-offline -q
COPY hero-parts-platform/src ./src
RUN mvn package -DskipTests -q

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
# Bundle pre-populated H2 DB so parts data is ready on first start
COPY data/heropartsdb.mv.db data/heropartsdb.mv.db
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=cloud
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
