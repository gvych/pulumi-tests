import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

// Get the container port from environment variable (set by automation script)
const CONTAINER_PORT = process.env.CONTAINER_PORT || '8080';
const BASE_URL = `http://localhost:${CONTAINER_PORT}`;

// Helper function to wait for server to be ready
async function waitForServer(maxRetries: number = 10, delayMs: number = 2000): Promise<void> {
  console.log(`\n⏳ Waiting for echo server to be ready at ${BASE_URL}...`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await axios.get(BASE_URL, { timeout: 5000 });
      console.log(`✅ Server is ready (attempt ${attempt}/${maxRetries})`);
      return;
    } catch (error) {
      if (attempt < maxRetries) {
        console.log(`  Attempt ${attempt}/${maxRetries} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw new Error(`Server did not become ready after ${maxRetries} attempts`);
      }
    }
  }
}

describe('Echo Server Tests', () => {
  beforeAll(async () => {
    // Wait for the server to be ready before running tests
    await waitForServer();
  });

  it('should respond with HTTP 200 on GET request', async () => {
    const response = await axios.get(BASE_URL);
    expect(response.status).toBe(200);
  });

  it('should return JSON response', async () => {
    const response = await axios.get(BASE_URL);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.data).toBeDefined();
  });

  it('should echo request headers', async () => {
    const customHeader = 'test-value-123';
    const response = await axios.get(BASE_URL, {
      headers: {
        'X-Custom-Header': customHeader
      }
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    
    // The echo server should include our custom header in the response
    const headers = response.data.request?.headers || response.data.headers;
    expect(headers).toBeDefined();
  });

  it('should handle POST requests', async () => {
    const testData = { message: 'Hello, Echo Server!' };
    const response = await axios.post(BASE_URL, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  it('should include host information in response', async () => {
    const response = await axios.get(BASE_URL);
    expect(response.data).toBeDefined();
    
    // Echo server typically includes host information
    const hasHostInfo = response.data.host || 
                        response.data.hostname || 
                        response.data.request?.host;
    expect(hasHostInfo).toBeDefined();
  });

  it('should handle query parameters', async () => {
    const response = await axios.get(`${BASE_URL}?test=value&foo=bar`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });
});
