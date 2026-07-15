import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { config as fontAwesomeConfig } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { appRouter } from "./app/router";
import { createCrmQueryClient } from "./shared/lib/query-client";
import { CrmErrorBoundary } from "./shared/ui/CrmErrorBoundary";
import "./shared/styles/general-sans.css";
import "./styles.css";

// CSP style-src 'self' blocks FA's runtime <style> injection — ship CSS via Vite instead.
fontAwesomeConfig.autoAddCss = false;

const queryClient = createCrmQueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CrmErrorBoundary>
        <RouterProvider router={appRouter} />
      </CrmErrorBoundary>
    </QueryClientProvider>
  </StrictMode>
);
