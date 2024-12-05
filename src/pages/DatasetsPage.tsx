import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { Button, Card, Icon, IconButton, useStyles2 } from '@grafana/ui';
import { getBackendSrv, PluginPage } from '@grafana/runtime';
import { prefixRoute } from 'utils/utils.routing';
import { Link } from 'react-router-dom';
import { ROUTES } from 'constants';
import moment from 'moment';

interface Dataset {
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


function DatasetsPage() {
  const s = useStyles2(getStyles);

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
    <PluginPage>
      <div>
        <ul>
        {listState.map((ds) => {
          return (
            <Card key={ds.metadata.name} href={prefixRoute(`${ROUTES.dataset}/${ds.metadata.name}`)}>
              <Card.Heading>{ds.spec.title}</Card.Heading>
              <Card.Figure>
                <Icon name="file-alt" size="xl"></Icon>
              </Card.Figure>
              <Card.Meta>
                <div>Created {moment(ds.metadata.creationTimestamp).fromNow()}</div>
                <div>{ds.spec.info.length} series</div>
                <div>{ds.spec.info.map((i) => i.rows).reduce((p, c) => p + c)} rows</div>
              </Card.Meta>
              <Button
                onClick={() => {
                  deleteDataset(ds.metadata.name);
                }}
                aria-label="remove"
                icon="trash-alt"
              >
                Delete dataset
              </Button>
            </Card>
          );
        })}
        </ul>
      </div>
    </PluginPage>
  );
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
