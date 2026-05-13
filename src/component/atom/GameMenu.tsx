import type { Background } from "@/config/enums";
import { VERSION } from "@/config/variable";
import { DialogContext } from "@/context/DialogContext";
import { SoundEffectContext } from "@/context/SoundEffectContext";
import type { SoundEffectContextValue } from "@/hook/useSoundEffect";
import { useCoreStore } from "@/store/useCoreStore";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import CloseIcon from "@mui/icons-material/Close";
import {
  FormControl,
  FormControlLabel,
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
import { Link } from "react-router-dom";
import { useShallow } from "zustand/shallow";
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
  memo,
  description,
  children,
}: {
  title: string;
  memo?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Stack gap={0.2}>
      <Stack
        component={Paper}
        variant="outlined"
        px={2}
        py={1}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={5}
        minHeight={56}
        maxHeight={56}
      >
        <Stack direction="row" gap={2} alignItems="center" flexShrink={0}>
          <Typography variant="body1">{title}</Typography>
          {memo && (
            <Typography variant="body2" color="text.secondary">
              {memo}
            </Typography>
          )}
        </Stack>
        {children}
      </Stack>
      {description && (
        <Stack
          direction="row"
          component={Paper}
          variant="outlined"
          px={2}
          py={1}
          gap={5}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary" flexShrink={0}>
            재생중인 음악 🎵
          </Typography>
          {description}
        </Stack>
      )}
    </Stack>
  );
};

const marqueeKeyframes = `
  @keyframes marquee-seamless {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(-1 * var(--marquee-segment-width, 0px)));
    }
  }
`;

interface GameMenuProps {}
const GameMenu: React.FC<GameMenuProps> = () => {
  const { setDialogOpen } = useContext(DialogContext);
  const changeDarkMode = useCoreStore((state) => state.actions.changeDarkMode);
  const changeAnimationEffect = useCoreStore(
    (state) => state.actions.changeAnimationEffect,
  );
  const changeBackground = useCoreStore(
    (state) => state.actions.changeBackground,
  );
  const useTempSlot = useCoreStore(
    useShallow((state) => state.settings.useTempSlot),
  );
  const setUseTempSlot = useCoreStore(
    useShallow((state) => state.actions.setUseTempSlot),
  );
  const setGameUseTempSlot = useSolitaireStore(
    useShallow((state) => state.setUseTempSlot),
  );
  const gameSetting = useSolitaireStore(
    useShallow((state) => state.gameSetting),
  );
  const setIsReady = useSolitaireStore(useShallow((state) => state.setIsReady));
  const resetInfo = useCoreStore(
    useShallow((state) => state.actions.resetInfo),
  );
  const { actions } = useContext<SoundEffectContextValue>(
    SoundEffectContext as unknown as React.Context<SoundEffectContextValue>,
  );
  const hasTemp = useSolitaireStore(
    useShallow((state) => state.deck.temp.length > 0),
  );
  const [value, setValue] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [marqueeSpeed] = React.useState(20);
  const [marqueeGap] = React.useState(100);
  const { effects, effectSound, backgroundMusic } = useCoreStore(
    (state) => state.settings,
  );
  const trackName = backgroundMusic.track.split("/").pop() ?? "unknown";
  const marqueeContainerRef = React.useRef<HTMLDivElement | null>(null);
  const marqueeSegmentRef = React.useRef<HTMLSpanElement | null>(null);
  const [segmentWidth, setSegmentWidth] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [dialogEnteredNonce, setDialogEnteredNonce] = React.useState(0);
  const marqueeDuration = React.useMemo(() => {
    if (!segmentWidth || marqueeSpeed <= 0) return 0;
    return segmentWidth / marqueeSpeed;
  }, [segmentWidth, marqueeSpeed]);
  const marqueeRepeatCount = React.useMemo(() => {
    if (!segmentWidth || !containerWidth) return 3;
    return Math.max(3, Math.ceil(containerWidth / segmentWidth) + 2);
  }, [containerWidth, segmentWidth]);

  React.useLayoutEffect(() => {
    const segmentElement = marqueeSegmentRef.current;
    const containerElement = marqueeContainerRef.current;
    if (!segmentElement || !containerElement) return;

    const measure = () => {
      setSegmentWidth(segmentElement.getBoundingClientRect().width);
      setContainerWidth(containerElement.getBoundingClientRect().width);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(segmentElement);
    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    trackName,
    marqueeGap,
    open,
    value,
    backgroundMusic.playing,
    dialogEnteredNonce,
  ]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeUseTempSlot = (checked: boolean) => {
    if (hasTemp) {
      setDialogOpen(true, {
        title: "임시 슬롯에 카드가 있습니다.",
        content:
          "임시 슬롯을 비워야 변경할 수 있습니다. 새 게임을 시작하시겠습니까?",
        action: () => {
          setIsReady(false);
          setTimeout(() => {
            actions.playShuffleSound();
          }, 300);
          gameSetting();
          resetInfo();

          setUseTempSlot(checked);
          setGameUseTempSlot(checked);
        },
      });
    } else {
      setUseTempSlot(checked);
      setGameUseTempSlot(checked);
    }
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
        slotProps={{
          transition: {
            onEntered: () => setDialogEnteredNonce((n) => n + 1),
          },
        }}
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
            <Tab label="게임 설정" />
            <Tab label="효과 설정" />
            <Tab label="사운드 설정" />
            <Tab label="크레딧 및 정보" />
          </Tabs>
          <Stack gap={1} p={3}>
            {value === 0 && (
              <>
                <OptionField title="임시 슬롯 사용 여부">
                  <FormControl component="fieldset" variant="standard">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useTempSlot}
                          slotProps={{
                            input: { "aria-label": "임시 슬롯 사용 여부" },
                          }}
                          onChange={(event) => {
                            event.preventDefault();
                            handleChangeUseTempSlot(event.target.checked);
                          }}
                        />
                      }
                      label="임시 슬롯 사용 여부"
                    />
                  </FormControl>
                </OptionField>
              </>
            )}
            {value === 1 && (
              <>
                <OptionField
                  title="애니메이션 효과"
                  memo="준비 중인 기능입니다."
                >
                  <Switch
                    checked={effects.animation}
                    onChange={(event) =>
                      changeAnimationEffect(event.target.checked)
                    }
                    disabled={true}
                  />
                </OptionField>
                <OptionField title="배경 효과">
                  <Select
                    size="small"
                    variant="outlined"
                    value={effects.background}
                    onChange={(event) =>
                      changeBackground(event.target.value as Background)
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
            {value === 2 && (
              <>
                <OptionField title="효과음">
                  <Switch
                    checked={effectSound}
                    onChange={(event) =>
                      actions.toggleSound(event.target.checked)
                    }
                  />
                </OptionField>
                <OptionField
                  title="배경음악"
                  description={
                    backgroundMusic.playing ? (
                      <div
                        ref={marqueeContainerRef}
                        style={{
                          width: "100%",
                          overflow: "hidden",
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            whiteSpace: "nowrap",
                            willChange: "transform",
                            animation:
                              segmentWidth > 0 && marqueeDuration > 0
                                ? `marquee-seamless ${marqueeDuration}s linear infinite`
                                : "none",
                            ["--marquee-segment-width" as string]: `${segmentWidth}px`,
                          }}
                        >
                          {Array.from({ length: marqueeRepeatCount }).map(
                            (_, idx) => (
                              <Typography
                                key={idx}
                                ref={idx === 0 ? marqueeSegmentRef : undefined}
                                variant="body1"
                                component="span"
                                sx={{
                                  pr: `${marqueeGap}px`,
                                  flexShrink: 0,
                                }}
                              >
                                {trackName}
                              </Typography>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null
                  }
                >
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
                {/* <OptionField
                  title="곡명 스크롤 속도"
                  memo={`${marqueeSpeed}px/s`}
                >
                  <Slider
                    value={marqueeSpeed}
                    step={5}
                    min={20}
                    max={200}
                    onChange={(_event, newValue) =>
                      setMarqueeSpeed(Number(newValue))
                    }
                    sx={{ width: 180 }}
                  />
                </OptionField>
                <OptionField title="곡명 간격" memo={`${marqueeGap}px`}>
                  <Slider
                    value={marqueeGap}
                    step={2}
                    min={8}
                    max={120}
                    onChange={(_event, newValue) =>
                      setMarqueeGap(Number(newValue))
                    }
                    sx={{ width: 180 }}
                  />
                </OptionField> */}
              </>
            )}
            {value === 3 && (
              <>
                <OptionField title="게임 버전">
                  <Typography>v{VERSION}</Typography>
                </OptionField>
                <OptionField title="개발자">
                  <Typography
                    component={Link}
                    target="_blank"
                    to="https://kkn1125.github.io/portfolio-renew/"
                  >
                    Kyungnam Kim
                  </Typography>
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
      <style>{marqueeKeyframes}</style>
    </React.Fragment>
  );
};

export default GameMenu;
