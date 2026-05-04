import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { useMemo, type ReactNode } from "react";
import { useShallow } from "zustand/shallow";
import { useCoreStore } from "@/store/useCoreStore";

interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const mode = useCoreStore(
    useShallow((state) => state.settings.effects.theme),
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        typography: {
          fontFamily: "GeekbleMalrangiche, sans-serif",
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
