# Aladia Challenge

## Description

User authentication and registration system built with **NestJS** microservices architecture. This project provides secure user management with JWT-based authentication, refresh tokens, and password hashing.

### Folders

- **`apps/gateway`**: Public HTTP REST API that exposes authentication endpoints and communicates with the authentication microservice via TCP.

- **`apps/authentication`**: Microservice that handles user registration, login, JWT generation, and password hashing. It is connected to MongoDB for data persistence.

- **`common/`**: Shared Data Transfer Objects (DTOs) used across services for validation and type safety.

- **`config/`**: Centralized configuration files for environment variables, database connection, and application settings.

- **`core/`**: Reusable infrastructure modules including Database module, JWT Guards, and shared utilities.

## Implemented Features

- **HTTP Gateway and Authentication Microservice**: Using `@nestjs/microservices`
- **TCP Communication**: TCP conection between services using `@nestjs/microservices`
- **Request Validation**: With `class-validator` + `class-transformer` + DTOs
- **MongoDB**: Using `@nestjs/mongoose`
- **JWT Authentication**: Implement access and refresh Tokens with `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`
- **Token Rotation**: Implement Refresh token revocation with MongoDB storage with TTL indexes
- **Password Hashing**: Using `bcrypt` with SALT_ROUNDS set in 10
- **Protected Routes** : Require authorization using `JwtAuthGuard` with `passport-jwt` strategy
- **Dockerization**: Multi-stage builds with `docker-compose.yml`
- **Test Coverage**: unit and e2e using `Jest` and `Supertest`
- **Health Checks**: Microservice status monitoring with`@nestjs/terminus`
- **Rate Limiting**: Globar and per endpoint configuration with `@nestjs/throttler`

## Initialization

### Docker

**1. Create `.env` file in project root:**

Create the `.env` file based on `.env.example` and use the environment variables provided in the attached file from the assignment email.

**2. Start services:**

```bash
docker compose up --build
```

**3. Access:**

- Gateway: http://localhost:3000

### Local

#### 1. Install dependencies

```bash
npm install
```

#### 2. Configure environment variables

Create the `.env` file based on `.env.example` and use the environment variables provided in the attached file from the assignment email.

#### 3. Start services

**Terminal 1 - Authentication Microservice:**

```bash
npm run start:auth
```

**Terminal 2 - Gateway:**

```bash
npm run start:gateway
```

## Endpoints

### Public

#### `POST /auth/register` - Register user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### `POST /auth/login` - Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Returns:

```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": { ... }
}
```

#### `POST /auth/refresh` - Refresh access token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

#### `GET /auth/health` - Health Check

Checks gateway status and connectivity with the authentication microservice.

```bash
curl http://localhost:3000/auth/health
```

**Successful response:**

```json
{
  "status": "ok",
  "info": {
    "authentication-service": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "authentication-service": {
      "status": "up"
    }
  }
}
```

**Error response:**

```json
{
  "status": "error",
  "error": {
    "authentication-service": {
      "status": "down",
      "message": "Connection refused"
    }
  }
}
```

---

## Rate Limiting

The Gateway implements **rate limiting** to protect against DDoS attacks.

### **Configuration:**

- 10 requests per minute per IP (default for all endpoints)
- 5 request per minute per IP for endpoint `POST /auth/login`
- 100 request per minute per IP for health endpoint `GET /auth/health`

### **Response when limit exceeded:**

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
Retry-After: 60

{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Security

- Passwords hashed with **bcrypt** (SALT_ROUNDS=10) and never returned in responses
- **Access Token**: Expires in 15 minutes
- **Refresh Token**: Expires in 7 days and are stored in MongoDB with revocation
- Protected routes with JWT authentication using **Passport.js**

## Testing

### Unit Tests

Run unit tests for the project:

```bash
npm run test
```

### E2E Tests

Run end-to-end tests for all Gateway endpoints. **Note:** You must have the project running before executing E2E tests.

```bash
npm run test:e2e
```

### Coverage

Generate test coverage report:

```bash
npm run test:cov
```

This command will generate a `coverage/` folder. You can open the HTML visualization with:

```bash
open ./coverage/lcov-report/index.html
```
