import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { environment } from '@/relay/environment';
import { Layout } from '@/components/layout/Layout';
import { routeMap } from '@/lib/route-map';
import { SessionBoundary } from '@/components/layout/SessionBoundary';

function App() {
  return (
    <SessionBoundary>
      <RelayEnvironmentProvider environment={environment}>
        <BrowserRouter basename="/clog">
          <Layout>
            <Suspense fallback={<p role="status">Loading...</p>}>
              <Routes>
                {routeMap.map((route) => (
                  <Route key={route.path} path={route.path} element={<route.element />}>
                    {route.children?.map((child) => (
                      <Route key={`${route.path}/${child.path}`} path={child.path} element={<child.element />} />
                    ))}
                  </Route>
                ))}
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </RelayEnvironmentProvider>
    </SessionBoundary>
  );
}

export default App;
