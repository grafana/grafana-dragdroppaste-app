import { DataFrameJSON, FieldType } from "@grafana/data";
import { Dataset } from "types";
import { doesDatasourceExist } from "utils/api";


function table(df: DataFrameJSON[], ds: Dataset, dsUid: string) {
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
    datasource: { uid: dsUid, type: 'yesoreyeram-infinity-datasource' },
  };

  return { icon: '', title: 'Use content as table', panel: panel };
}

function timeseries(df: DataFrameJSON[], ds: Dataset, dsUid: string) {
  const firstFrame = df[0];
  if (firstFrame.schema?.fields.find((x) => x.type === FieldType.time)) {
    const panel = {
      id: 0,
      type: 'timeseries',
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
      datasource: { uid: dsUid, type: 'yesoreyeram-infinity-datasource' },
    };

    return { icon: '', title: 'Use content as timeseries', panel: panel };
  }
}

function geomap(df: DataFrameJSON[], ds: Dataset, dsUid: string) {
  const firstFrame = df[0];
  if (
    firstFrame.schema?.fields.find((x) => x.name === 'latitude') &&
    firstFrame.schema?.fields.find((x) => x.name === 'longitude')
  ) {
    const panel = {
      id: 0,
      type: 'geomap',
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
      datasource: { uid: dsUid, type: 'yesoreyeram-infinity-datasource' },
    };

    return { icon: '', title: 'Use content as geomap', panel: panel };
  }
}


export async function constructPanel(input: { ds: Dataset; originalFrames: DataFrameJSON[] }) {
  const dsUid = await doesDatasourceExist('yesoreyeram-infinity-datasource');
  if (!dsUid) {
    throw new Error('no infinity datasource set up');
  }
  const { ds, originalFrames } = input;

  const asd = [timeseries, geomap, table].map((f) => f(originalFrames, ds, dsUid)).filter((r) => r !== undefined);
  return asd;
}
