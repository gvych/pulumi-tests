import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const config = new pulumi.Config();

const echoMessage =
    config.get("message") ??
    "Hello from Pulumi!";

const echoImage = new docker.RemoteImage("echo-image", {
    name: "hashicorp/http-echo",
});

const echoContainer = new docker.Container("echo-container", {
    name: "echo",
    image: echoImage.latest,
    command: [`-text=${echoMessage}`],
    ports: [
        {
            internal: 5678,
            external: 5678,
        },
    ],
});

export const containerId = echoContainer.id;
export const containerName = echoContainer.name;
export const containerListenPort = echoContainer.ports.apply(
    (ports) => ports?.[0]?.external ?? 5678,
);
