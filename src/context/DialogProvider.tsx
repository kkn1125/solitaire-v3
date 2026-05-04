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
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [content, setContent] = useState<string | undefined>(undefined);

  function closeDialog() {
    setOpen(false);
    setAction(undefined);
  }

  function setDialogOpen(
    isOpen: boolean,
    options?: { title?: string; content?: string; action: () => void },
  ) {
    setOpen(isOpen);
    if (!isOpen) {
      setAction(undefined);
      return;
    }
    setAction(() => options?.action);
    setTitle(options?.title ?? "게임 재시작");
    setContent(options?.content ?? "게임을 재시작하시겠습니까?");
  }

  return (
    <DialogContext.Provider value={{ dialogOpen: open, setDialogOpen }}>
      {children}
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
          <DialogActions>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              gap={2}
              mt={2}
            >
              <GameButton color="secondary" title="취소" onClick={closeDialog}>
                <FaSquareXmark />
              </GameButton>
              <GameButton
                color="primary"
                title="확인"
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
