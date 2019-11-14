import * as azure from "@pulumi/azure";
import * as k8s from "@pulumi/kubernetes";
import * as config from "./config";
import * as pulumi from "@pulumi/pulumi";

// Create a static public IP for the Azure Service LoadBalancer.
// Required for AKS as the automatic LoadBalancer is still in preview.
export function createAzureStaticIp(name: string): pulumi.Output<string> {
    let azureStaticAppIp: pulumi.Output<string> = pulumi.output("");
    if (name === "aks") {
        azureStaticAppIp = new azure.network.PublicIp(`${name}-staticAppIp`, {
            resourceGroupName: config.aksResourceGroup,
            allocationMethod: "Static"
        }).ipAddress;
    }
    return azureStaticAppIp;
}

export function getAppUrl(name: string, service: k8s.core.v1.Service): pulumi.Output<string> {
    // The address appears in different places depending on the Kubernetes service provider.
    let address = service.status.loadBalancer.ingress[0].hostname;
    let appUrl: pulumi.Output<string> = pulumi.output("");
    if (name === "gke" || name === "aks") {
        address = service.status.loadBalancer.ingress[0].ip;
        appUrl = pulumi.interpolate`http://${address}`;
    } else {
        appUrl = pulumi.interpolate`http://${address}`;
    }

    return appUrl;
}
