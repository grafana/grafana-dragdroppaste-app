import { DataFrameJSON } from "@grafana/data";

export interface Dataset {
  kind: string;
  apiVersion: string;
  metadata: {
    name: string;
    creationTimestamp: string;
  };
  spec: {
    title: string;
    description: string;
    data: DataFrameJSON;
    info: Array<{ rows: number }>;
  };
}
