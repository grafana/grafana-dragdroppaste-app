import { Accept } from 'react-dropzone';
import { concatMap, from, lastValueFrom, map, Observable, toArray } from 'rxjs';

import { DataFrame, DataFrameJSON, dataFrameToJSON, toDataFrame } from '@grafana/data';
import { v6 as uuidv6 } from 'uuid';
import { getBackendSrv } from '@grafana/runtime';
import { Dataset } from 'types';
import { constructPanel } from './constructPanel';

export interface FileImportResult {
  dataFrames: DataFrame[];
  file: File;
}

function getFileExtensions(acceptedFiles: Accept) {
  const fileExtentions = new Set<string>();
  Object.keys(acceptedFiles).forEach((v) => {
    acceptedFiles[v].forEach((extension) => {
      fileExtentions.add(extension);
    });
  });
  return fileExtentions;
}

export function formatFileTypes(acceptedFiles: Accept) {
  const fileExtentions = Array.from(getFileExtensions(acceptedFiles));
  if (fileExtentions.length === 1) {
    return fileExtentions[0];
  }
  return `${fileExtentions.slice(0, -1).join(', ')} or ${fileExtentions.slice(-1)}`;
}

export function filesToDataframes(files: File[]): Observable<FileImportResult> {
  return new Observable<FileImportResult>((subscriber) => {
    let completedFiles = 0;
    import('utils/sheet')
      .then((sheet) => {
        files.forEach((file) => {
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          reader.onload = () => {
            const result = reader.result;
            if (result && result instanceof ArrayBuffer) {
              if (file.type === 'application/json') {
                const decoder = new TextDecoder('utf-8');
                const json = JSON.parse(decoder.decode(result));
                subscriber.next({ dataFrames: [toDataFrame(json)], file: file });
              } else {
                subscriber.next({ dataFrames: sheet.readSpreadsheet(result), file: file });
              }
              if (++completedFiles >= files.length) {
                subscriber.complete();
              }
            }
          };
        });
      })
      .catch(() => {
        throw 'Failed to load sheets module';
      });
  });
}

export async function fileHandler(file: File) {
  const backendSrv = getBackendSrv();

  const sendDataset = async (ds: any, df: DataFrameJSON[]) => {
    const result = await backendSrv.post<Dataset>('/apis/dataset.grafana.app/v0alpha1/namespaces/default/datasets', ds);
    return { ds: result, originalFrames: df }
  };

  const res = await lastValueFrom(
    filesToDataframes([file]).pipe(
      concatMap((res) => {
        const df = res.dataFrames.map((x) => dataFrameToJSON(x));
        const ds = makeDataset(df, res.file.name, res.file.name);

        // Return the observable for the post request
        return from(sendDataset(ds, df));
      }),
      toArray() // Collect all metadata.names into an array
    )
  );

  return await constructPanel(res[0]);
}


function makeDataset(frames: DataFrameJSON[], title: string, description: string) {
  const newFrames = frames.map((f) => {
    const newFields = f.schema?.fields.map((x) => ({
      name: x.name,
      type: x.type,
      typeInfo: { frame: x.type === 'number' ? 'float64' : x.type, nullable: true },
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
