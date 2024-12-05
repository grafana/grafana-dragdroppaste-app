import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { DataFrame, dataFrameFromJSON, getDisplayProcessor, GrafanaTheme2 } from '@grafana/data';
import { Table, useStyles2, useTheme2 } from '@grafana/ui';
import { getBackendSrv, PluginPage } from '@grafana/runtime';
import { useParams } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';

interface Dataset {
  kind: string;
  apiVersion: string;
  metadata: {
    name: string;
  };
  spec: {
    title: string;
    description: string;
    data: object;
  };
}


function fixDataFrame(df: DataFrame, theme: GrafanaTheme2) {
  df.fields = df.fields.map((f) => {
    return { ...f, display: getDisplayProcessor({ field: f, theme: theme }) };
  });
  
  return df;
}

function DatasetPage() {
  const { name } = useParams<{ name: string }>();
  const s = useStyles2(getStyles);
  const theme = useTheme2();

  const [dataset, setDataset] = useState<Dataset>();
  const backendSrv = getBackendSrv();

  useEffect(() => {
    updateDataset();
  }, []);

  const updateDataset = () => {
    const res = backendSrv.get(`/apis/dataset.grafana.app/v0alpha1/namespaces/default/datasets/${name}/data`)
    res.then((data) => {
      console.log(data);
      setDataset(data);
    });
  };

  return (
    <PluginPage>
      <div>
        <h1>{dataset?.spec.title}</h1>
        <AutoSizer>
          {({ width }) => (
            <div>
              {dataset?.spec.data.map((df) => {
                return (
                  <Table
                    width={width}
                    height={800}
                    key={df.title}
                    data={fixDataFrame(dataFrameFromJSON(df), theme)}
                  ></Table>
                );
              })}
            </div>
          )}
        </AutoSizer>
      </div>
    </PluginPage>
  );
}

export default DatasetPage;

const getStyles = (theme: GrafanaTheme2) => ({
  marginTop: css`
    margin-top: ${theme.spacing(2)};
  `,
});
