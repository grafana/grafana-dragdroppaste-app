import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { DataFrame, dataFrameFromJSON, getDisplayProcessor, GrafanaTheme2 } from '@grafana/data';
import { Button, Card, Icon, Table, useStyles2, useTheme2 } from '@grafana/ui';
import { getBackendSrv, PluginPage } from '@grafana/runtime';
import { prefixRoute } from 'utils/utils.routing';
import { useParams } from 'react-router-dom';
import { ROUTES } from 'constants';
import moment from 'moment';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Dataset } from 'types';


const ListView = () => {

  const [listState, setListState] = useState<Dataset[]>([]);
  const backendSrv = getBackendSrv();

  useEffect(() => {
    updateList();
  }, []);

  const updateList = () => {
    const res = backendSrv.get('/apis/dataset.grafana.app/v0alpha1/namespaces/default/datasets');
    res.then((data) => {
      setListState(data.items);
    });
  };

  const deleteDataset = (name: string) => {
    const res = backendSrv.delete(`/apis/dataset.grafana.app/v0alpha1/namespaces/default/datasets/${name}`);
    res.then(() => {
      updateList();
    });
  };

  return (
      <div>
        <ul>
        {listState.map((ds) => {
          return (
            <Card key={ds.metadata.name} href={prefixRoute(`${ROUTES.datasets}/${ds.metadata.name}`)}>
              <Card.Heading>{ds.spec.title}</Card.Heading>
              <Card.Figure>
                <Icon name="file-alt" size="xl"></Icon>
              </Card.Figure>
              <Card.Meta>
                <div>Created {moment(ds.metadata.creationTimestamp).fromNow()}</div>
                <div>{ds.spec.info.length} series</div>
                <div>{ds.spec.info.map((i) => i.rows).reduce((p, c) => p + c)} rows</div>
              </Card.Meta>
              <Card.Tags>
                <Button
                  onClick={() => {
                    deleteDataset(ds.metadata.name);
                  }}
                  aria-label="remove"
                  icon="trash-alt"
                >
                  Delete dataset
                </Button>
              </Card.Tags>
            </Card>
          );
        })}
        </ul>
      </div>
  );
}

function fixDataFrame(df: DataFrame, theme: GrafanaTheme2) {
  df.fields = df.fields.map((f) => {
    return { ...f, display: getDisplayProcessor({ field: f, theme: theme }) };
  });
  
  return df;
}

const DatasetView = ({ name }: {name: string}) => {
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
  );
}


function DatasetsPage() {
  const { name } = useParams<{ name: string }>();
  return <PluginPage>{!name ? <ListView></ListView> : <DatasetView name={name}></DatasetView>}</PluginPage>;
}

export default DatasetsPage;

const getStyles = (theme: GrafanaTheme2) => ({
  marginTop: css`
    margin-top: ${theme.spacing(2)};
  `,
  link: css`
    color: ${theme.colors.text.link};
    text-decoration: underline;
  `,
});
