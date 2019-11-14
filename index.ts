import * as k8s from "@pulumi/kubernetes";
import * as azure from "@pulumi/azure";
import * as pulumi from "@pulumi/pulumi";
import * as nginx from "./nginx";
import * as config from "./config";

const projectName = pulumi.getProject();

// Form the 3 cluster providers for k8s using each cluster's kubeconfig.
interface Cluster {
    kubeconfig: pulumi.Output<any>,
    provider: k8s.Provider,
}

const aksProvider = new k8s.Provider("aksProvider", {kubeconfig: config.aksKubeconfig});
const eksProvider = new k8s.Provider("eksProvider", {kubeconfig: config.eksKubeconfig});
const gkeProvider = new k8s.Provider("gkeProvider", {kubeconfig: config.gkeKubeconfig});

const clusterConfigs: {[key: string]: Cluster} = {
    "aks": { kubeconfig: config.aksKubeconfig, provider: aksProvider},
    "eks": { kubeconfig: config.eksKubeconfig, provider: eksProvider},
    "gke": { kubeconfig: config.gkeKubeconfig, provider: gkeProvider},
};

// To export the list of app URLs of the demo app across all clusters.
interface appUrl {
    name: string,
    url: pulumi.Output<string>,
}

// Create the application on each of the clusters selected to use.
export let appUrls: appUrl[] = [];
let clustersToUse: string[] = config.useCluster ? [config.useCluster] : ["eks", "aks", "gke"];
for (const clusterName of clustersToUse) {
    const cluster = clusterConfigs[clusterName];

    // Deploy the app.
    const instance = new nginx.NginxApp(clusterName, {
        provider: cluster.provider,
    });

    // Get the app's public load balancer URL.
    let instanceUrl: appUrl = {name: clusterName, url: instance.appUrl};
    appUrls = appUrls.concat(instanceUrl);
}
