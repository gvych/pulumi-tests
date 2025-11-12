import * as pulumi from "@pulumi/pulumi";
import { LocalWorkspace } from "@pulumi/pulumi/automation";
import axios from "axios";
import * as path from "path";

interface TestResult {
    success: boolean;
    message: string;
    details?: any;
}

/**
 * Test the deployed echo server
 */
async function testEchoServer(port: number, maxRetries: number = 10): Promise<TestResult> {
    const url = `http://localhost:${port}`;
    
    console.log(`\n🧪 Testing echo server at ${url}...`);
    
    // Wait a bit for container to fully start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Retry logic since container might take a moment to be ready
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`  Attempt ${attempt}/${maxRetries}...`);
            
            const response = await axios.get(url, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Pulumi-Test-Client'
                }
            });
            
            if (response.status === 200) {
                console.log(`  ✅ Server responded with status ${response.status}`);
                console.log(`  Response data:`, JSON.stringify(response.data, null, 2));
                
                return {
                    success: true,
                    message: `Echo server is working correctly on port ${port}`,
                    details: {
                        status: response.status,
                        data: response.data
                    }
                };
            } else {
                console.log(`  ⚠️  Unexpected status code: ${response.status}`);
            }
        } catch (error: any) {
            if (attempt < maxRetries) {
                console.log(`  ⏳ Connection failed, waiting before retry...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error(`  ❌ All attempts failed`);
                return {
                    success: false,
                    message: `Echo server test failed after ${maxRetries} attempts`,
                    details: {
                        error: error.message,
                        code: error.code
                    }
                };
            }
        }
    }
    
    return {
        success: false,
        message: `Echo server test failed after ${maxRetries} attempts`,
    };
}

/**
 * Main automation function
 */
async function deployAndTest() {
    console.log("🚀 Starting Pulumi Automation API deployment and test...\n");
    
    const stackName = "test";
    const workDir = __dirname;
    
    try {
        // Create or select the stack
        console.log(`📦 Setting up stack: ${stackName}`);
        const stack = await LocalWorkspace.createOrSelectStack({
            stackName,
            workDir,
        });
        
        console.log("✅ Stack selected/created successfully");
        console.log(`📂 Working directory: ${workDir}`);
        
        // Refresh the stack to ensure it's up to date
        console.log("\n🔄 Refreshing stack configuration...");
        await stack.refresh({ onOutput: (msg) => process.stdout.write(msg) });
        console.log("✅ Stack ready");
        
        // Run pulumi up
        console.log("\n⬆️  Running pulumi up...");
        const upResult = await stack.up({ onOutput: (msg) => process.stdout.write(msg) });
        
        console.log("\n✅ Pulumi up completed successfully!");
        console.log(`Summary:`);
        console.log(`  - Resources created: ${upResult.summary.resourceChanges?.create || 0}`);
        console.log(`  - Resources updated: ${upResult.summary.resourceChanges?.update || 0}`);
        console.log(`  - Resources deleted: ${upResult.summary.resourceChanges?.delete || 0}`);
        
        // Get outputs
        const outputs = await stack.outputs();
        console.log("\n📤 Stack outputs:");
        for (const [key, output] of Object.entries(outputs)) {
            console.log(`  - ${key}: ${output.value}`);
        }
        
        // Extract container port from outputs
        const containerPort = outputs.containerPort?.value;
        
        if (!containerPort) {
            throw new Error("Container port not found in stack outputs");
        }
        
        // Run tests against the deployed resources
        const testResult = await testEchoServer(containerPort);
        
        if (testResult.success) {
            console.log(`\n✅ ${testResult.message}`);
            console.log("\n🎉 Deployment and testing completed successfully!");
            process.exit(0);
        } else {
            console.error(`\n❌ TEST FAILED: ${testResult.message}`);
            if (testResult.details) {
                console.error("Error details:", JSON.stringify(testResult.details, null, 2));
            }
            process.exit(1);
        }
        
    } catch (error: any) {
        console.error("\n❌ ERROR during deployment or testing:");
        console.error(error.message);
        
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }
        
        // Check if it's a Pulumi-specific error
        if (error.stderr) {
            console.error("\nPulumi stderr:");
            console.error(error.stderr);
        }
        
        process.exit(1);
    }
}

// Run the automation
deployAndTest().catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
