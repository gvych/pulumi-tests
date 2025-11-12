# Pulumi Automation API - Deploy and Test

This project demonstrates automated Pulumi deployment and testing using the Pulumi Automation API.

## Overview

The project consists of:
- **index.ts**: Pulumi infrastructure code that deploys a Docker container running an echo server
- **automation.ts**: Automation script that deploys the infrastructure and runs tests

## What It Does

The automation script (`automation.ts`):
1. ✅ Creates/selects a Pulumi stack using the Automation API
2. ✅ Installs required Pulumi plugin dependencies
3. ✅ Runs `pulumi up` to provision resources (Docker echo server container)
4. ✅ Tests the deployed echo server by making HTTP requests
5. ✅ Reports success or failure with detailed error messages

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

After deployment, the automation script:
- Waits for the container to start
- Makes HTTP requests to `http://localhost:8080`
- Retries up to 10 times with 2-second delays
- Reports success if the server responds with HTTP 200
- Reports failure with error details if tests fail

## Exit Codes

- `0`: Deployment and tests successful
- `1`: Deployment failed or tests failed

## Output Example

```
🚀 Starting Pulumi Automation API deployment and test...

📦 Setting up stack: test
✅ Stack selected/created successfully
📂 Working directory: /workspace

📥 Installing dependencies...
✅ Dependencies installed

⬆️  Running pulumi up...
[Pulumi output...]
✅ Pulumi up completed successfully!

🧪 Testing echo server at http://localhost:8080...
  ✅ Server responded with status 200

✅ Echo server is working correctly on port 8080

🎉 Deployment and testing completed successfully!
```

## Cleanup

To destroy the deployed resources:

```bash
pulumi destroy --stack test
```

## Error Handling

The script includes comprehensive error handling:
- Catches deployment errors from Pulumi
- Handles network timeouts during testing
- Provides detailed error messages and stack traces
- Returns appropriate exit codes for CI/CD integration
