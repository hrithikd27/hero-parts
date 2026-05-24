# ── Build stage ───────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
# Bundle the pre-populated H2 database so parts data is ready on first start
COPY data/heropartsdb.mv.db data/heropartsdb.mv.db
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=cloud
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
