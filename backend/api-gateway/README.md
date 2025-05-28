# API Gateway

A robust API Gateway for the Business Activity Management Information System, providing secure routing of requests between microservices with JWT-based authentication, role-based access control (RBAC), and comprehensive security features.

## Features

### Core Functionality
- **Service Routing**: Routes requests to appropriate microservices
- **API Versioning**: Supports versioned API endpoints
- **Request/Response Transformation**: Transforms requests and responses as needed
- **Health Checks**: Monitors service health and availability

### Security
- **JWT Authentication**: Secure authentication using JSON Web Tokens
- **Role-Based Access Control (RBAC)**: Fine-grained access control based on user roles and permissions
- **Token Blacklisting**: Prevents use of revoked tokens
- **Rate Limiting**: Prevents abuse through configurable rate limits
- **Request Validation**: Validates incoming requests against defined schemas
- **Content Security Policy**: Protects against XSS and other injection attacks
- **Attack Prevention**: Detects and blocks common attack patterns

### Performance
- **Circuit Breaker Pattern**: Prevents cascading failures when services are unavailable
- **Response Caching**: Improves performance by caching frequently accessed data
- **Compression**: Reduces response size for faster transmission
- **Request Throttling**: Limits resource-intensive operations

### Observability
- **Correlation IDs**: Tracks requests across services for easier debugging
- **Metrics Collection**: Gathers performance metrics for monitoring
- **Structured Logging**: Provides detailed logs with correlation IDs
- **Error Handling**: Standardized error responses with appropriate status codes

## API Endpoints

The API Gateway exposes the following service endpoints:

- `/api/v1/auth`: Authentication and user management
- `/api/v1/orders`: Order management
- `/api/v1/crm`: Customer relationship management
- `/api/v1/inventory`: Inventory management
- `/api/v1/finance`: Financial management
- `/api/v1/analytics`: Analytics and reporting
- `/api/v1/metrics`: Performance metrics (admin only)
- `/api/v1/cache`: Cache management (admin only)

## Environment Variables

The API Gateway can be configured using the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port to run the API Gateway on | `3000` |
| `NODE_ENV` | Environment (development, production) | `development` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `*` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key-should-be-in-env` |
| `JWT_ACCESS_EXPIRY` | Expiry time for access tokens | `15m` |
| `JWT_REFRESH_EXPIRY` | Expiry time for refresh tokens | `7d` |
| `LOG_LEVEL` | Logging level | `info` |
| `LOG_FORMAT` | Logging format | `combined` |
| `AUTH_SERVICE_URL` | URL for the Auth Service | `http://localhost:3001` |
| `ORDER_SERVICE_URL` | URL for the Order Service | `http://localhost:3002` |
| `CRM_SERVICE_URL` | URL for the CRM Service | `http://localhost:3003` |
| `INVENTORY_SERVICE_URL` | URL for the Inventory Service | `http://localhost:3004` |
| `FINANCE_SERVICE_URL` | URL for the Finance Service | `http://localhost:3005` |
| `ANALYTICS_SERVICE_URL` | URL for the Analytics Service | `http://localhost:3006` |

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd api-gateway
   npm install
   ```
3. Create a `.env` file with the required environment variables
4. Start the server:
   ```
   npm start
   ```

For development with auto-restart:
```
npm run dev
```

## Security Considerations

- Always use HTTPS in production
- Store JWT secrets securely and rotate them periodically
- Implement proper token validation and expiration
- Use rate limiting to prevent brute force attacks
- Validate all input data to prevent injection attacks
- Keep dependencies up to date to avoid security vulnerabilities

## Performance Optimization

- Enable response caching for read-heavy endpoints
- Use compression for all responses
- Implement circuit breakers for service resilience
- Apply throttling to resource-intensive operations
- Monitor and optimize database queries

## Monitoring and Maintenance

- Use the `/health` endpoint to check API Gateway status
- Monitor metrics via the `/api/v1/metrics` endpoint
- Clear cache when needed via the `/api/v1/cache/clear` endpoint
- Check logs for errors and performance issues
- Set up alerts for service failures and performance degradation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
