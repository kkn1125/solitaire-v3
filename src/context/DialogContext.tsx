import { createContext } from "react";

export const DialogContext = createContext<{
  dialogOpen: boolean;
  setDialogOpen: (open: boolean, action?: () => void) => void;
}>({
  dialogOpen: false,
  setDialogOpen: (_open: boolean, _action?: () => void) => {},
});
