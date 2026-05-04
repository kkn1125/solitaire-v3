import { VERSION } from "@/config/variable";
import { SoundEffectContext } from "@/context/SoundEffectContext";
import type { SoundEffectContextValue } from "@/hook/useSoundEffect";
import { useCoreStore } from "@/store/useCoreStore";
import CloseIcon from "@mui/icons-material/Close";
import {
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useContext } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import GameButton from "./GameButton";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const OptionField = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      px={2}
      py={1}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography variant="body1">{title}</Typography>
      {children}
    </Stack>
  );
};

interface GameMenuProps {}
const GameMenu: React.FC<GameMenuProps> = () => {
  const changeDarkMode = useCoreStore((state) => state.actions.changeDarkMode);
  const changeAnimationEffect = useCoreStore(
    (state) => state.actions.changeAnimationEffect,
  );
  const changeBackground = useCoreStore(
    (state) => state.actions.changeBackground,
  );
  const [value, setValue] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const { effects, effectSound, backgroundMusic } = useCoreStore(
    (state) => state.settings,
  );

  const { actions } = useContext<SoundEffectContextValue>(
    SoundEffectContext as unknown as React.Context<SoundEffectContextValue>,
  );

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <React.Fragment>
      <GameButton title="설정" placement="top" onClick={handleClickOpen}>
        <GiHamburgerMenu />
      </GameButton>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          게임 설정
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers sx={{ minHeight: "50vh" }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="효과 설정" />
            <Tab label="사운드 설정" />
            <Tab label="크레딧 및 정보" />
          </Tabs>
          <Stack gap={1} p={3}>
            {value === 0 && (
              <>
                <OptionField title="애니메이션 효과">
                  <Switch
                    checked={effects.animation}
                    onChange={(event) =>
                      changeAnimationEffect(event.target.checked)
                    }
                  />
                </OptionField>
                <OptionField title="배경 효과">
                  <Select
                    size="small"
                    variant="outlined"
                    value={effects.background}
                    onChange={(event) =>
                      changeBackground(event.target.value as BackgroundType)
                    }
                  >
                    <MenuItem value="default">기본 배경</MenuItem>
                    <MenuItem value="wood">편백나무 배경</MenuItem>
                    <MenuItem value="grid">격자무늬 배경</MenuItem>
                    <MenuItem value="grid-green">
                      어두운 격자무늬(녹) 배경
                    </MenuItem>
                    <MenuItem value="grid-blue">
                      어두운 격자무늬(청) 배경
                    </MenuItem>
                    <MenuItem value="dark-clover">
                      어두운 네잎클로버 배경
                    </MenuItem>
                    <MenuItem value="clover">네잎클로버 배경</MenuItem>
                  </Select>
                </OptionField>
                <OptionField title="다크모드">
                  <Switch
                    checked={effects.theme === "dark"}
                    slotProps={{ input: { "aria-label": "다크모드" } }}
                    onChange={(event) =>
                      changeDarkMode(event.target.checked ? "dark" : "light")
                    }
                  />
                </OptionField>
              </>
            )}
            {value === 1 && (
              <>
                <OptionField title="효과음">
                  <Switch
                    checked={effectSound}
                    onChange={(event) =>
                      actions.toggleSound(event.target.checked)
                    }
                  />
                </OptionField>
                <OptionField title="배경음악">
                  <Switch
                    checked={backgroundMusic.playing}
                    onChange={(event) =>
                      actions.toggleBackgroundMusic(event.target.checked)
                    }
                  />
                </OptionField>
                <OptionField title="배경음악 볼륨">
                  <Slider
                    value={backgroundMusic.volume}
                    step={0.01}
                    min={0}
                    max={1}
                    onChange={(event) =>
                      actions.changeBackgroundMusicVolume(
                        Number((event.target as HTMLInputElement).value) || 0,
                      )
                    }
                  />
                </OptionField>
              </>
            )}
            {value === 2 && (
              <>
                <OptionField title="게임 버전">
                  <Typography>v{VERSION}</Typography>
                </OptionField>
              </>
            )}
          </Stack>
        </DialogContent>
        {/* <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Save changes
          </Button>
        </DialogActions> */}
      </BootstrapDialog>
    </React.Fragment>
  );
};

export default GameMenu;
