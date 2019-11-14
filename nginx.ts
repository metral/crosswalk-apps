import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as pulumi from "@pulumi/pulumi";
import * as utils from "./utils";

// Arguments for the demo app.
export interface NginxAppArgs {
    provider: k8s.Provider // Provider resource for the target Kubernetes cluster.
}

export class NginxApp extends pulumi.ComponentResource {
    public appUrl: pulumi.Output<string>;

    constructor(name: string,
                args: NginxAppArgs,
                opts: pulumi.ComponentResourceOptions = {}) {
        super("examples:kubernetes-ts-multicloud:demo-app", name, args, opts);

        //
        // Example using Typescript (pulumi/kubernetes)
        //

        // Create the Deployment.
        const appLabels = {app: name};
        const deployment = new k8s.apps.v1.Deployment(`${name}`, {
            spec: {
                selector: {matchLabels: appLabels},
                replicas: 1,
                template: {
                    metadata: {labels: appLabels},
                    spec: {
                        containers: [
                            {
                                name: "nginx",
                                image: "nginx:1.16",
                                ports: [{containerPort: 80, name: "http"}],
                            }
                        ],
                    },
                },
            }
        }, {provider: args.provider, parent: this});

        // Create a LoadBalancer Service to expose Deployment.
        const service = new k8s.core.v1.Service(`${name}-demo-app`, {
            spec: {
                // loadBalancerIP is required for AKS (automatic load balancer is still in preview).
                loadBalancerIP: utils.createAzureStaticIp(`${name}-demo-app`),
                selector: appLabels,
                ports: [{port: 80, targetPort: "http"}],
                type: name === "local" ? "ClusterIP" : "LoadBalancer",
            }
        }, {provider: args.provider, parent: this});



        //
        // Example using Typescript KX (pulumi/kubernetesx)
        //

        /*
        // Create a KX PodBuilder.
        const nginxPB = new kx.PodBuilder({
            containers: [{ image: "nginx:1.16", ports: [{containerPort: 80, name: "http"}]}]
        });

        // Create a KX Deployment from the KX PodBuilder by transforming it into a DeploymentSpec.
        const deploymentKx = new kx.Deployment(`${name}-kx`, {
            spec: nginxPB.asDeploymentSpec({replicas: 1})
        }, { provider: args.provider });

        // Create a LoadBalancer Service to expose Deployment.
        const service = deploymentKx.createService({type: kx.types.ServiceType.LoadBalancer,
            loadBalancerIP: utils.createAzureStaticIp(`${name}-kx-demo-app`)}
        );
        */


        this.appUrl = utils.getAppUrl(name, service);
        this.registerOutputs();
    }
}
