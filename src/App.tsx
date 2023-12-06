import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { Main } from "./pages/Main";

import "flatpickr/dist/themes/light.css";
import "simplebar/dist/simplebar.min.css";
import "tippy.js/dist/tippy.css";

import { LoadingSpinner } from "@deskpro/app-sdk";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import { Suspense } from "react";
import { Redirect } from "./components/Redirect/Redirect";
import { query } from "./utils/query";
import { FindOrCreate } from "./pages/FindOrCreate/FindOrCreate";
import { ViewObject } from "./pages/View/Object";
import { CreateObject } from "./pages/Create/Object";
import { EditObject } from "./pages/Edit/Edit";

function App() {
  return (
    <HashRouter>
      <QueryClientProvider client={query}>
        <Suspense fallback={<LoadingSpinner />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
                <Routes>
                  <Route path="/">
                    <Route path="redirect" element={<Redirect />} />
                    <Route index element={<Main />} />
                    <Route path="create">
                      <Route path=":objectName" element={<CreateObject />} />
                    </Route>
                    <Route path="edit">
                      <Route
                        path=":objectName/:objectId"
                        element={<EditObject />}
                      />
                    </Route>
                    <Route path="/findOrCreate" element={<FindOrCreate />} />
                    <Route path="admin"></Route>
                    <Route path="view">
                      <Route
                        path=":objectView/:objectName/:objectId"
                        element={<ViewObject key={Math.random()} />}
                      />
                    </Route>
                  </Route>
                </Routes>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;
