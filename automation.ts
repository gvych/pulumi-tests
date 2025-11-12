import * as pulumi from "@pulumi/pulumi";
import { LocalWorkspace } from "@pulumi/pulumi/automation";
import { spawn } from "child_process";

/**
 * Run Vitest tests
 */
async function runTests(containerPort: number): Promise<boolean> {
    console.log(`\n🧪 Running Vitest tests against deployed resources...`);
    console.log(`   Container port: ${containerPort}`);
    
    return new Promise((resolve) => {
        const vitestProcess = spawn('npm', ['test'], {
            env: {
                ...process.env,
                CONTAINER_PORT: containerPort.toString(),
            },
            stdio: 'inherit',
            shell: true,
        });
        
        vitestProcess.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ All tests passed!');
                resolve(true);
            } else {
                console.error(`\n❌ Tests failed with exit code ${code}`);
                resolve(false);
            }
        });
        
        vitestProcess.on('error', (error) => {
            console.error('\n❌ Error running tests:', error.message);
            resolve(false);
        });
    });
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
        
        // Run Vitest tests against the deployed resources
        const testsPassed = await runTests(containerPort);
        
        if (testsPassed) {
            console.log("\n🎉 Deployment and testing completed successfully!");
            process.exit(0);
        } else {
            console.error("\n❌ Tests failed! See error details above.");
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
