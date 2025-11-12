# Pulumi Automation API - Deploy and Test

This project demonstrates automated Pulumi deployment and testing using the Pulumi Automation API with Vitest.

## Overview

The project consists of:
- **index.ts**: Pulumi infrastructure code that deploys a Docker container running an echo server
- **automation.ts**: Automation script that deploys the infrastructure and runs Vitest tests
- **echo-server.test.ts**: Vitest test suite for the echo server
- **vitest.config.ts**: Vitest configuration

## What It Does

The automation script (`automation.ts`):
1. ✅ Creates/selects a Pulumi stack using the Automation API
2. ✅ Refreshes the stack configuration
3. ✅ Runs `pulumi up` to provision resources (Docker echo server container)
4. ✅ Runs Vitest test suite against the deployed echo server
5. ✅ Reports success or failure with detailed test results

## Prerequisites

- Node.js and npm installed
- Docker installed and running
- Pulumi CLI installed

## Setup

1. Install dependencies:
```bash
npm install
```

## Usage

Run the automated deployment and test:

```bash
npm run deploy-and-test
```

Or directly with ts-node:

```bash
npx ts-node automation.ts
```

## What Gets Deployed

The infrastructure code deploys:
- Docker image: `ealen/echo-server:latest`
- Docker container with port 8080 exposed
- Echo server listening on port 80 inside the container

## Testing

The test suite (`echo-server.test.ts`) includes:
- ✅ HTTP 200 response validation
- ✅ JSON response format verification
- ✅ Request header echoing tests
- ✅ POST request handling
- ✅ Host information validation
- ✅ Query parameter handling

The tests automatically:
- Wait for the container to start (with retry logic)
- Run comprehensive validation against the echo server
- Provide detailed test reports via Vitest
- Report failures with clear error messages

You can also run tests independently:
```bash
# Run tests against a running container on port 8080
CONTAINER_PORT=8080 npm test

# Run tests in watch mode for development
CONTAINER_PORT=8080 npm run test:watch
```

## Exit Codes

- `0`: Deployment and tests successful
- `1`: Deployment failed or tests failed

## Output Example

```
🚀 Starting Pulumi Automation API deployment and test...

📦 Setting up stack: test
✅ Stack selected/created successfully
📂 Working directory: /workspace

🔄 Refreshing stack configuration...
✅ Stack ready

⬆️  Running pulumi up...
[Pulumi output...]
✅ Pulumi up completed successfully!

Summary:
  - Resources created: 2
  - Resources updated: 0
  - Resources deleted: 0

📤 Stack outputs:
  - containerName: echo-container-abc123
  - containerPort: 8080

🧪 Running Vitest tests against deployed resources...
   Container port: 8080

⏳ Waiting for echo server to be ready at http://localhost:8080...
✅ Server is ready (attempt 1/10)

 ✓ echo-server.test.ts (6)
   ✓ Echo Server Tests (6)
     ✓ should respond with HTTP 200 on GET request
     ✓ should return JSON response
     ✓ should echo request headers
     ✓ should handle POST requests
     ✓ should include host information in response
     ✓ should handle query parameters

Test Files  1 passed (1)
     Tests  6 passed (6)

✅ All tests passed!

🎉 Deployment and testing completed successfully!
```

## Cleanup

To destroy the deployed resources:

```bash
pulumi destroy --stack test
```

## Why Vitest?

This project uses Vitest as the testing framework for several benefits:
- 🚀 **Fast**: Lightning-fast test execution with smart module caching
- 🎯 **Modern**: Built for modern TypeScript/JavaScript projects
- 🔧 **Great DX**: Watch mode, clear error messages, and excellent IDE integration
- 📊 **Rich Reporting**: Detailed test results and coverage reports
- ✅ **Easy to Manage**: Simple test organization with `describe`, `it`, `beforeAll`, etc.
- 🔄 **Retry Logic**: Built-in support for async operations and retries

## Error Handling

The script includes comprehensive error handling:
- Catches deployment errors from Pulumi
- Handles network timeouts during testing with retry logic
- Provides detailed error messages via Vitest's reporting
- Returns appropriate exit codes for CI/CD integration
- Test failures show exactly which assertions failed
