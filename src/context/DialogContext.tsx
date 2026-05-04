import { createContext } from "react";

export const DialogContext = createContext<{
  dialogOpen: boolean;
  setDialogOpen: (
    open: boolean,
    options?: { title?: string; content?: string; action: () => void },
  ) => void;
}>({
  dialogOpen: false,
  setDialogOpen: (
    _open: boolean,
    _options?: { title?: string; content?: string; action: () => void },
  ) => {},
});
