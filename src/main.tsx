import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DeskproAppProvider } from "@deskpro/app-sdk";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as Element);
root.render(
  <React.StrictMode>
    <DeskproAppProvider>
      <App />
    </DeskproAppProvider>
  </React.StrictMode>
);
