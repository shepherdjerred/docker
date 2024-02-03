import { Chart } from "npm:cdk8s";
import { Application } from "../../imports/argoproj.io.ts";
import { DatadogAgentV2Alpha1 } from "../../imports/datadoghq.com.ts";
import { OnePasswordItem } from "../../imports/onepassword.com.ts";

export function createDatadogApp(chart: Chart) {
  new Application(chart, "datadog-app", {
    metadata: {
      name: "datadog",
      namespace: "argocd",
    },
    spec: {
      project: "default",
      source: {
        repoUrl: "https://helm.datadoghq.com",
        targetRevision: "1.4.1",
        chart: "datadog-operator",
      },
      destination: {
        server: "https://kubernetes.default.svc",
        namespace: "datadog",
      },
      syncPolicy: {
        automated: {},
        syncOptions: ["CreateNamespace=true"],
      },
    },
  });

  const item = new OnePasswordItem(chart, "datadog-secret", {
    spec: {
      itemPath:
        "vaults/v64ocnykdqju4ui6j6pua56xw4/items/jn4difq4yuehvaif6va3zxrvle",
    },
    metadata: {
      namespace: "datadog",
    },
  });

  new DatadogAgentV2Alpha1(chart, "datadog-agent", {
    spec: {
      global: {
        site: "datadoghq.com",
        credentials: {
          apiSecret: {
            secretName: item.name,
            keyName: "api-key",
          },
          appSecret: {
            secretName: item.name,
            keyName: "app-key",
          },
        },
      },
      override: {
        clusterAgent: {
          image: {
            name: "gcr.io/datadoghq/cluster-agent:latest",
          },
        },
        nodeAgent: {
          image: {
            name: "gcr.io/datadoghq/agent:latest",
          },
        },
      },
    },
  });
}
