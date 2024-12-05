
import { DataFrameJSON, dataFrameToJSON, Field, FieldType } from '@grafana/data';
import { v6 as uuidv6 } from 'uuid';
import { getBackendSrv } from '@grafana/runtime';
import { Dataset } from 'types';
import { constructPanel } from './constructPanel';



function stringToDataFrame(data: string) {
  const lines = data.split('\n');

  const firstLine = lines.shift();
  if (!firstLine) {
    return;
  }

  const headers = firstLine.split('\t');

  const df = {
    fields: headers.map((cell: string): Field => {
      return { name: cell, type: FieldType.string, values: [], config: {} };
    }),
    length: lines.length,
  };

  for (const line of lines) {
    const vals = line.split('\t');
    for (let i = 0; i < df.fields.length; i++) {
      df.fields[i].values.push(vals[i]);
    }
  }

  return dataFrameToJSON(df)
}

export async function pasteHandler(data: string) {
  const backendSrv = getBackendSrv();
  const df = stringToDataFrame(data)
  if (!df) {
    return 
  }
  const ds = makeDataset([df], 'title', 'description');

  const result = await backendSrv.post('/apis/dataset.grafana.app/v0alpha1/namespaces/default/datasets', ds) as Dataset;

  return constructPanel(result);
}

function makeDataset(frames: DataFrameJSON[], title: string, description: string) {
  const newFrames = frames.map((f) => {
    const newFields = f.schema?.fields.map((x) => ({
      name: x.name,
      type: x.type,
      typeInfo: { frame: x.type === 'number' ? 'int64' : x.type, nullable: true },
    }));
    return { ...f, schema: { ...f.schema, fields: newFields } };
  });

  return {
    kind: 'Dataset',
    apiVersion: 'dataset.grafana.app/v0alpha1',
    metadata: {
        name: uuidv6(),
    },
    spec: {
      title: title,
      description: description,
      data: newFrames,
    },
  };
}
