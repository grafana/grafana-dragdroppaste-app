import { DataFrameJSON, FieldType } from "@grafana/data";
import { Dataset } from "types";

export function detectType(df: DataFrameJSON[]){
    const firstFrame = df[0];
    if(!firstFrame) {
        return 'table';
    }

    console.log(firstFrame)

    if(firstFrame.schema?.fields.find((x) => x.type === FieldType.time)){
        return 'timeseries';
    }

    if(firstFrame.schema?.fields.find((x) => x.name === 'latitude') && firstFrame.schema?.fields.find((x) => x.name === 'longitude')){
        return 'geomap';
    }
    return 'table';
}


export function constructPanel(input: {ds: Dataset, originalFrames: DataFrameJSON[]}) {

  const {ds, originalFrames} = input;

  const type = detectType(originalFrames);

  const panel = {
    id: 0,
    type: type,
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

  return { icon: '', title: 'Use content as table', panel: panel };
}
