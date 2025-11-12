import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

// Pull the echo server image
const echoImage = new docker.RemoteImage("echo-image", {
    name: "ealen/echo-server:latest",
    keepLocally: true,
});

// Create a Docker container running the echo server
const echoContainer = new docker.Container("echo-container", {
    image: echoImage.imageId,
    ports: [{
        internal: 80,
        external: 8080,
    }],
    envs: [
        "PORT=80",
    ],
});

// Export the container name and port
export const containerName = echoContainer.name;
export const containerPort = 8080;
