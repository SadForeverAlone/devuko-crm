import { createBrowserRouter, Navigate } from "react-router-dom";
import { App } from "./App";
import { CrmTabRoute } from "@/pages/crm/ui/CrmTabRoute";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/crm" replace />,
  },
  {
    path: "/crm",
    element: <App />,
    children: [
      { index: true, element: <CrmTabRoute /> },
      { path: "dashboard/:part?", element: <CrmTabRoute /> },
      { path: "logs", element: <CrmTabRoute /> },
      { path: "users/:userId?", element: <CrmTabRoute /> },
      { path: "team/:userId?", element: <CrmTabRoute /> },
      { path: "promises/:promiseId?", element: <CrmTabRoute /> },
      { path: "pages", element: <CrmTabRoute /> },
      { path: "contacts", element: <CrmTabRoute /> },
      { path: "reports", element: <CrmTabRoute /> },
      { path: "settings", element: <CrmTabRoute /> },
      { path: "projects/:projectId?/:projectTab?", element: <CrmTabRoute /> },
      { path: "infrastructure/:section?", element: <CrmTabRoute /> },
      { path: "deployments", element: <CrmTabRoute /> },
      { path: "monitoring", element: <CrmTabRoute /> },
      { path: "automation", element: <CrmTabRoute /> },
      { path: "notifications", element: <CrmTabRoute /> },
      { path: "sites/*", element: <Navigate to="/crm/projects" replace /> },
      { path: "security", element: <Navigate to="/crm/monitoring" replace /> },
      { path: "*", element: <CrmTabRoute /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/crm" replace />,
  },
]);
