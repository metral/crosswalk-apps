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

		const wordpress = new k8s.helm.v2.Chart("wordpress", {
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
		});

		this.appUrl = wordpress
			.getResourceProperty("v1/Service", "wordpress", "status")
			.apply(status => {
				const endpoint = status.loadBalancer.ingress[0].ip || status.loadBalancer.ingress[0].hostname;
				return `http://${endpoint}:80`;
			});

		this.registerOutputs();
	}
}
