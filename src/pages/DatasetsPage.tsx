import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { IconButton, useStyles2 } from '@grafana/ui';
import { getBackendSrv, PluginPage } from '@grafana/runtime';
import { prefixRoute } from 'utils/utils.routing';
import { Link } from 'react-router-dom';
import { ROUTES } from 'constants';

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
            <li key={ds.metadata.name}>
            <Link className={s.link} to={prefixRoute(`${ROUTES.dataset}/${ds.metadata.name}`)}>
              {ds.spec.title}
            </Link>
              <IconButton
                onClick={() => {
                  deleteDataset(ds.metadata.name);
                }}
                aria-label="remove"
                name="trash-alt"
              ></IconButton>
            </li>
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
