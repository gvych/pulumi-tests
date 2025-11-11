import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

// Create a Docker container with echo
const container = new docker.Container("echo-container", {
    image: "alpine:latest",
    command: ["echo", "Hello from Pulumi Docker container!"],
    name: "echo-container",
});

// Export the container name
export const containerName = container.name;
