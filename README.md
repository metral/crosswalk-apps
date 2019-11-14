# Kubernetes Apps

Deploys Kubernetes apps across AKS, EKS, GKE clusters setup with Pulumi and
[Crosswalk for Kubernetes](https://www.pulumi.com/docs/guides/crosswalk/kubernetes).

## Pre-Requisites

1. [Get Started with Kubernetes on Pulumi](https://www.pulumi.com/docs/get-started/kubernetes/)

## Initialize the Pulumi Project

1.  Clone the repo:

    ```bash
    $ git clone https://github.com/metral/crosswalk-apps
	$ cd crosswalk-apps
    ```

1.  Install the dependencies.

    ```bash
    $ npm install
    ```

1. Create a new stack, which is an isolated deployment target for this example:

    ```bash
    $ pulumi stack init
    ```

1. Configure the stack.

    Choose a single cluster to deploy to: `eks`, `aks`, or `gke`.

    By default, if no single cluster is chosen, all 3 options are used for deployments.

    For example, to run only on EKS:

    ```bash
    $ pulumi config set crosswalk-apps:useCluster eks
    ```

    To reset to use all clouds, simply remove the `useCluster` config setting.
        
    ```bash
    $ pulumi config rm crosswalk-apps:useCluster
    ```

## Deploy the Pulumi Project

Update the stack.

```bash
$ pulumi up
```

## Query the Cluster

For example, on EKS:

```bash
$ export KUBECONFIG=`pwd`/kubeconfigs/kubeconfig-eks.json
$ kubectl get pods, services -A
```
   
## Clean Up

Once you've finished experimenting, tear down your stack's resources by destroying and removing it:

```bash
$ pulumi destroy --yes
$ pulumi stack rm --yes
```
