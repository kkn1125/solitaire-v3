import GameButton from "@/component/atom/GameButton";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { FaSquareCheck, FaSquareXmark } from "react-icons/fa6";
import { DialogContext } from "./DialogContext";

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<(() => void) | undefined>(undefined);

  function closeDialog() {
    setOpen(false);
    setAction(undefined);
  }

  function setDialogOpen(isOpen: boolean, nextAction?: () => void) {
    setOpen(isOpen);
    if (!isOpen) {
      setAction(undefined);
      return;
    }
    setAction(() => nextAction);
  }

  return (
    <DialogContext.Provider value={{ dialogOpen: open, setDialogOpen }}>
      {children}
      <Dialog
        open={open}
        onClose={closeDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>게임 재시작</DialogTitle>
        <DialogContent>
          <DialogContentText>게임을 재시작하시겠습니까?</DialogContentText>
          <DialogActions>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              gap={2}
              mt={2}
            >
              <GameButton
                color="secondary"
                title="취소"
                onClick={closeDialog}
              >
                <FaSquareXmark />
              </GameButton>
              <GameButton
                color="primary"
                title="재시작"
                onClick={() => {
                  closeDialog();
                  action?.();
                }}
              >
                <FaSquareCheck />
              </GameButton>
            </Stack>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};
