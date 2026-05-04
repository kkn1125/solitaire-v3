import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./assets/index.css";
import { DialogProvider } from "./context/DialogProvider.tsx";
import { SoundEffectProvider } from "./context/SoundEffectProvider";
import { AppThemeProvider } from "./providers/AppThemeProvider";
import Router from "./Router.tsx";

createRoot(document.getElementById("root")!).render(
  <AppThemeProvider>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SoundEffectProvider>
        <DialogProvider>
          <Router />
        </DialogProvider>
      </SoundEffectProvider>
    </BrowserRouter>
  </AppThemeProvider>,
);
