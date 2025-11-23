import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./assets/index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    theme={createTheme({
      palette: {
        mode: "light",
      },
      typography: {
        fontFamily: "GeekbleMalrangiche, sans-serif",
      },
    })}
  >
    <CssBaseline />
    <App />
  </ThemeProvider>
);
