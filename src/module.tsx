import React, { Suspense, lazy } from 'react';
import { AppPlugin, type AppRootProps } from '@grafana/data';
import { LoadingPlaceholder } from '@grafana/ui';
import type { AppConfigProps } from './components/AppConfig/AppConfig';
import { fileHandler } from 'handlers/fileHandler';
import { pasteHandler } from 'handlers/pasteHandler';

const LazyApp = lazy(() => import('./components/App/App'));
const LazyAppConfig = lazy(() => import('./components/AppConfig/AppConfig'));

const App = (props: AppRootProps) => (
  <Suspense fallback={<LoadingPlaceholder text="" />}>
    <LazyApp {...props} />
  </Suspense>
);

const AppConfig = (props: AppConfigProps) => (
  <Suspense fallback={<LoadingPlaceholder text="" />}>
    <LazyAppConfig {...props} />
  </Suspense>
);

export const plugin = new AppPlugin<{}>()
  .setRootPage(App)
  .addConfigPage({
    title: 'Configuration',
    icon: 'cog',
    body: AppConfig,
    id: 'configuration',
  })
  .addHook({
    title: 'foo',
    targets: ['dashboard/grid'],
    hook: async (data: unknown) => {
      if (data instanceof File) {
        return await fileHandler(data);
      }
      return null;
    },
  })
  .addHook({
    title: 'pasteHook',
    targets: ['dashboard/dragndrop'],
    hook: async (data: unknown) => {
      if (typeof data === 'string') {
        return await pasteHandler(data);
      }
      return null;
    },
  });
