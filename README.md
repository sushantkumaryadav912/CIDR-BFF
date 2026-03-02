# CIDR BFF (Backend for Frontend)

API Gateway and UI Adapter Layer for Cloud Incident Detection & Response Platform.

## Architecture

```
Client → Node BFF → Java Core Backend → Python Detection → MongoDB/OpenSearch
```

## Responsibilities

✅ **What BFF Does:**
- JWT validation (cookie-based)
- Request validation & sanitization
- API proxy to Java backend
- Response formatting for UI
- Rate limiting
- Security headers
- Correlation ID tracking
- Structured logging

❌ **What BFF Does NOT Do:**
- Risk scoring
- Remediation execution
- Direct database access
- Business logic
- RBAC enforcement (handled by Java)
- JWT token generation (handled by Java)

## Tech Stack

- Node.js 20
- TypeScript
- Express.js
- Zod (validation)
- JWT (jsonwebtoken)
- Axios
- Helmet (security)
- express-rate-limit

## Environment Variables

```env
PORT=4000
JAVA_BACKEND_BASE_URL=https://javabackend.zeyo.xyz
NODE_ENV=development
JWT_SECRET=cidr-dev-secret-change-in-prod
ALLOWED_ORIGINS=http://localhost:3000
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## Docker

```bash
# Build
docker build -t cidr-bff .

# Run
docker run -p 4000:4000 \
  -e JAVA_BACKEND_BASE_URL=https://javabackend.zeyo.xyz \
  -e JWT_SECRET=your-secret \
  -e ALLOWED_ORIGINS=https://app.yourdomain.com \
  cidr-bff
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (rate limited: 5/15min)
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Alerts (Authenticated)
- `GET /api/alerts` - List alerts
- `GET /api/alerts/:id` - Get alert by ID
- `POST /api/alerts/:id/approve` - Approve alert
- `POST /api/alerts/:id/false-positive` - Mark false positive

### Logs (Authenticated)
- `GET /api/logs/search` - Search logs

### Workflows (Authenticated)
- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow by ID

## Rate Limits

- **Login**: 5 requests per 15 minutes per IP
- **Authenticated**: 100 requests per minute per org
- **Public**: 50 requests per minute per IP

## Security Features

- HTTP-only secure cookies
- Helmet security headers
- Strict CORS policy
- Input validation (Zod)
- Content-Type validation
- Request size limits (10MB)
- Sensitive data masking in logs
- No stack traces in production

## Response Format

### Success
```json
{
  "data": {...},
  "meta": {...}
}
```

### Error
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": []
  }
}
```

## Logging

Structured JSON logs with:
- Timestamp
- Log level
- Message
- Metadata
- Correlation ID
- Sensitive data masking

## Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

## Project Structure

```
src/
├── routes/           # API route handlers
│   ├── auth.routes.ts
│   ├── alerts.routes.ts
│   ├── logs.routes.ts
│   └── workflows.routes.ts
├── middleware/       # Express middleware
│   ├── auth.middleware.ts
│   ├── correlation.middleware.ts
│   ├── error.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── validation.middleware.ts
├── services/         # External service clients
│   └── java-api.service.ts
├── validators/       # Zod schemas
│   ├── auth.schema.ts
│   ├── alert.schema.ts
│   ├── log.schema.ts
│   └── workflow.schema.ts
├── utils/            # Utilities
│   ├── logger.ts
│   └── response-formatter.ts
├── app.ts            # Express app setup
└── server.ts         # Server entry point
```

## Production Checklist

- [ ] Update `JWT_SECRET` to match Java backend
- [ ] Set `ALLOWED_ORIGINS` to production frontend URL
- [ ] Set `NODE_ENV=production`
- [ ] Verify HTTPS is enabled
- [ ] Configure monitoring and alerting
- [ ] Set up log aggregation
- [ ] Review rate limits
- [ ] Test error handling
- [ ] Verify CORS configuration
