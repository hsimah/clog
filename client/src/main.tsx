import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { Theme } from "@astryxdesign/core/theme";
import { clogTheme } from "./theme/__generated__/clog";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme theme={clogTheme} mode="dark">
      <App />
    </Theme>
  </StrictMode>,
);
