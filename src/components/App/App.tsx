import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
const DatasetsPage = React.lazy(() => import('../../pages/DatasetsPage'));
function App(props: AppRootProps) {
  return (
    <Routes>

      {/* Default page */}
      <Route path="*" element={<DatasetsPage />} />
      <Route  path={`${ROUTES.datasets}/:name?`} element={<DatasetsPage />} />
    </Routes>
  );
}

export default App;
