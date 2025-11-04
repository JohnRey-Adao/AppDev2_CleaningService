# Multi-stage build for Spring Boot application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Copy Docker-specific parent POM (only includes backend module)
COPY backend/Dockerfile.pom.xml ./pom.xml

# Copy entire backend module (includes POMs and source code)
COPY backend/ ./backend/

# Build the backend app module (which includes data and business dependencies)
RUN mvn clean package -DskipTests -pl backend/app -am

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /build/backend/app/target/app-1.0.0.jar app.jar

# Create directory for uploads
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

