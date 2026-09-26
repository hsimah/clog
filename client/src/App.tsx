import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, type ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { client } from '@/lib/apollo';
import { DataProvider } from '@/context/DataContext';
import { RelayEnvironmentProvider } from 'react-relay';
import { environment } from '@/relay/environment';
import { Layout } from '@/components/layout/Layout';
import { routeMap } from '@/lib/route-map';
import { SessionBoundary } from '@/components/layout/SessionBoundary';

// Temporary bridge: migrated routes do not mount the all-collections provider.
function LegacyDataBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return ['/locations', '/items', '/home'].some((path) => pathname === path || pathname.startsWith(`${path}/`))
    ? children : <DataProvider>{children}</DataProvider>;
}

function App() {
  return (
    <ApolloProvider client={client}>
      <SessionBoundary>
        <RelayEnvironmentProvider environment={environment}>
          <BrowserRouter basename='/clog'>
            <Layout>
              <LegacyDataBoundary>
                <Suspense fallback={<div className="p-4">Loading...</div>}>
                  <Routes>
                    {routeMap.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={<route.element />}
                      >
                        {route.children?.map((child) => (
                          <Route
                            key={`${route.path}/${child.path}`}
                            path={child.path}
                            element={<child.element />}
                          />
                        ))}
                      </Route>
                    ))}
                  </Routes>
                </Suspense>
              </LegacyDataBoundary>
            </Layout>
          </BrowserRouter>
        </RelayEnvironmentProvider>
      </SessionBoundary>
    </ApolloProvider>
  );
}

export default App;
