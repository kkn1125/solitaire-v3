import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppThemeProvider } from "./providers/AppThemeProvider";
import Router from "./Router.tsx";
import "./assets/index.css";
import { SoundEffectProvider } from "./context/SoundEffectProvider";

createRoot(document.getElementById("root")!).render(
  <AppThemeProvider>
    <BrowserRouter>
      <SoundEffectProvider>
        <Router />
      </SoundEffectProvider>
    </BrowserRouter>
  </AppThemeProvider>,
);
