import { Dataset } from "types";

export function constructPanel(ds: Dataset) {
  const panel = {
    id: 0,
    type: 'table',
    title: ds.metadata.name,
    options: {},
    fieldConfig: {
      defaults: {},
      overrides: [],
    },
    targets: [
      {
        refId: 'A',
        type: 'series',
        source: 'unistore',
        format: 'table',
        dataset: ds.metadata.name,
      },
    ],
    datasource: { uid: 'fe5xn8w5do4xsf', type: 'yesoreyeram-infinity-datasource' },
  };

  return { icon: '', title: '', panel: panel };

}
