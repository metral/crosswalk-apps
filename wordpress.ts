import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// Arguments for the demo app.
export interface WordpressAppArgs {
    provider: k8s.Provider // Provider resource for the target Kubernetes cluster.
}

export class WordpressApp extends pulumi.ComponentResource {
	public appUrl: pulumi.Output<string>;

	constructor(name: string,
		args: WordpressAppArgs,
		opts: pulumi.ComponentResourceOptions = {}) {
		super("examples:kubernetes-ts-multicloud:demo-app", name, args, opts);

		//
		// Example using Typescript (pulumi/kubernetes)
		//

		const wordpress = new k8s.helm.v2.Chart(name, {
			chart: "stable/wordpress",
			version: "7.5.4",
			transformations: [
				(o: any) => {
					const annotations = (o.metadata && o.metadata.annotations) || {};
					const hook = annotations["helm.sh/hook"];
					if (hook === "test-success" || hook === "test-failure") {
						o.metadata.annotations = {"pulumi.com/skipAwait": "true"};
					}
					return o;
				}
			]
		}, {provider: args.provider});

		this.appUrl = wordpress
			.getResourceProperty("v1/Service", "eks-wp-wordpress", "status")
			.apply(status => {
                if (status) {
                    const endpoint = status.loadBalancer.ingress[0].hostname || status.loadBalancer.ingress[0].ip;
                    return `http://${endpoint}:80`;
                }
                return ""
			});

		this.registerOutputs();
	}
}
