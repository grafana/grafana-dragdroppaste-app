import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
const DatasetsPage = React.lazy(() => import('../../pages/DatasetsPage'));
const DatasetPage = React.lazy(() => import('../../pages/DatasetPage'));
function App(props: AppRootProps) {
  return (
    <Routes>

      {/* Default page */}
      <Route path="*" element={<DatasetsPage />} />
      <Route path={`${ROUTES.dataset}/:name?`} element={<DatasetPage />} />
    </Routes>
  );
}

export default App;
