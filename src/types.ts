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
    data: object;
    info: Array<{ rows: number }>;
  };
}
