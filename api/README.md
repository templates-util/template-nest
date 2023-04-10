# NestJS Project - Transactions and Users Management

This project aims to create a NestJS-based application that handles user management, CRUD operations for AWS S3, and transaction file processing.

## Features

- User management (authentication, registration, and CRUD operations)
- Transaction file submission and processing
- AWS S3 integration for file storage
- Docker-compose based services setup (PostgreSQL, S3, Prometheus, Grafana, Redis)

## Docker Compose Configuration

The `docker-compose.yml` file provided in the project sets up the following services:

1. **db**: PostgreSQL database for data persistence.
2. **storage**: Custom S3 storage service for file uploads.
3. **prometheus**: Prometheus service for monitoring and alerting.
4. **grafana**: Grafana service for data visualization and analytics.
5. **redis**: Redis service for caching and session management.
6. **app**: The main NestJS application.

## How to run the project

1. Make sure you have Docker and Docker Compose installed on your machine.
2. Clone the project repository.
3. Open a terminal and navigate to the project directory.
4. Run `docker-compose up -d` to start the services.
5. The NestJS application will be accessible at `http://localhost:5000`.

## Environment Variables

The following environment variables are used by the NestJS application:

- `AWS_S3_ENDPOINT`: The endpoint URL for the custom S3 storage service (default: `http://storage:9000/s3`)
- `TYPEORM_HOST`: The hostname for the PostgreSQL database (default: `db`)
- `REDIS_HOST`: The hostname for the Redis service (default: `redis`)
- `API_PORT`: The port on which the NestJS application runs (default: `5000`)

## Project Structure

The project consists of several modules, controllers, and services to handle the different functionalities:

- User management is handled by the `AuthModule`, `UserModule`, and their respective controllers and services.
- Transaction file submission and processing are managed by the `TransactionModule`, `TransactionController`, and `TransactionService`.
- AWS S3 integration is implemented in the `S3Module` and `S3Service`.

Feel free to explore the codebase for a better understanding of the project's structure and implementation.

