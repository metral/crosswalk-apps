import * as pulumi from "@pulumi/pulumi";
var fs = require("fs");

let pulumiConfig = new pulumi.Config();
export const useCluster = pulumiConfig.get("useCluster");

// Read the kubeconfig files for each cloud.

var eksKubeconfigData = fs.readFileSync(__dirname + "/kubeconfigs/kubeconfig-eks.json");
export const eksKubeconfig: pulumi.Output<any> = pulumi.output(eksKubeconfigData.toString());

var aksKubeconfigData = fs.readFileSync(__dirname + "/kubeconfigs/kubeconfig-aks.json");
export const aksKubeconfig: pulumi.Output<any> = pulumi.output(aksKubeconfigData.toString());
export const aksResourceGroup = "MC_k8s-azbf70a8a6_k8s-az-clusterfc254f3f_westus2"

var gkeKubeconfigData = fs.readFileSync(__dirname + "/kubeconfigs/kubeconfig-gke.json");
export const gkeKubeconfig: pulumi.Output<any> = pulumi.output(gkeKubeconfigData.toString());
