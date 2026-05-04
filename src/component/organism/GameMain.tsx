import { resolvePath } from "@/config/variable";
import { useWindowSize } from "@/hook/useWindowSize";
import { useCoreStore } from "@/store/useCoreStore";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import {
  Backdrop,
  Box,
  keyframes,
  Portal,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import EmptyCard from "../atom/EmptyCard";
import CardList from "../molecular/CardList";

interface GameMainProps {}
const GameMain: React.FC<GameMainProps> = () => {
  const { size, boardSectionGap, boardRowGap, groundColumnGap, boardPadX } =
    useWindowSize();
  // Foundation 순서: club, diamond, heart, spade
  const ref = useRef(null);
  const rev = useSolitaireStore(useShallow((state) => state.rev));
  const useTempSlot = useCoreStore(
    useShallow((state) => state.settings.useTempSlot),
  );
  const addBoardBase = useSolitaireStore(
    useShallow((state) => state.addBoardBase),
  );
  const setIsReady = useSolitaireStore(useShallow((state) => state.setIsReady));
  const isWaiting = useSolitaireStore(useShallow((state) => state.isWaiting));

  useEffect(() => {
    const unsubscribe = useSolitaireStore.subscribe(
      (state) => state.rev,
      (newRev) => {
        if (rev !== newRev) {
          if (ref.current) {
            addBoardBase(ref.current);
          }
        }
      },
    );

    const unsubscribe2 = useSolitaireStore.subscribe(
      (state) => [
        state.isBaseBindReady,
        state.isBindReady,
        state.isCardReady,
        state.elementLoadCount,
        state.isReady,
      ],
      ([
        newIsBaseBindReady,
        newIsBindReady,
        newIsCardReady,
        newElementLoadCount,
        newIsReady,
      ]) => {
        if (
          !newIsReady &&
          newIsBaseBindReady &&
          newIsBindReady &&
          newIsCardReady &&
          newElementLoadCount === 14
        ) {
          setTimeout(() => {
            setIsReady(true);
          }, 1000);
        }
      },
    );

    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [addBoardBase, ref, rev, setIsReady]);

  useEffect(() => {
    if (ref.current) {
      addBoardBase(ref.current);
    }
  }, [addBoardBase, ref, rev, size]);

  const fadeInKeyframes = keyframes`
    from { transform: translateY(-10px); }
    to { transform: translateY(0); }
  `;

  return (
    <Stack
      ref={ref}
      id="game-board"
      gap={boardSectionGap}
      flex={1}
      position="relative"
      px={boardPadX}
      sx={{ perspective: "1000px", perspectiveOrigin: "center center" }}
    >
      <CardList />

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={boardRowGap}
        sx={{ width: "100%" }}
      >
        <Stack direction="row" gap={groundColumnGap} flexShrink={0}>
          <EmptyCard id="stack-1" data-empty="true" />
          <EmptyCard id="waste-1" data-empty="true" />
        </Stack>

        <EmptyCard
          id="temp-1"
          data-empty="true"
          data-temp={useTempSlot ? "true" : "false"}
        />

        <Stack
          direction="row"
          gap={groundColumnGap}
          justifyContent="center"
          alignItems="center"
          minWidth={0}
        >
          <EmptyCard id="foundation-1" data-empty="true" />
          <EmptyCard id="foundation-2" data-empty="true" />
          <EmptyCard id="foundation-3" data-empty="true" />
          <EmptyCard id="foundation-4" data-empty="true" />
        </Stack>
      </Stack>
      <Stack
        direction="row"
        // justifyContent={size === "xs" ? "center" : "space-between"}
        justifyContent="center"
        gap={groundColumnGap}
      >
        <EmptyCard id="ground-1" data-empty="true" />
        <EmptyCard id="ground-2" data-empty="true" />
        <EmptyCard id="ground-3" data-empty="true" />
        <EmptyCard id="ground-4" data-empty="true" />
        <EmptyCard id="ground-5" data-empty="true" />
        <EmptyCard id="ground-6" data-empty="true" />
        <EmptyCard id="ground-7" data-empty="true" />
      </Stack>

      {isWaiting && (
        <Portal>
          <Backdrop open={isWaiting} component={Stack} gap={2}>
            <Box
              sx={{
                backgroundImage: `url(${resolvePath("images/success_image.png")})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                width: 300,
                height: 300,
                animation: `${fadeInKeyframes} 1s ease-in-out both infinite alternate`,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: "white",
                textAlign: "center",
                textShadow: "0 0 10px rgba(0, 0, 0, 0.75)",
              }}
            >
              게임을 중지했습니다.
            </Typography>
          </Backdrop>
        </Portal>
      )}
    </Stack>
  );
};

export default GameMain;
