import { Box, Container, Divider, Paper, Stack } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import {
  FaLightbulb,
  FaPalette,
  FaPause,
  FaReply,
  FaShuffle,
} from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import Display from "./component/atom/Display";
import SIconButton from "./component/atom/SIconButton";
import TrumpCard from "./component/atom/TrumpCard";
import CardDeck from "./component/molecular/CardDeck";
import { useCoreStore } from "./store/core.store";
import { useEffect } from "react";
import Solitaire from "./model/Solitaire";

function App() {
  const gameState = useCoreStore((state) => state.gameState);
  const moveStackToWaste = useCoreStore((state) => state.moveStackToWaste);
  const selectWasteCard = useCoreStore((state) => state.selectWasteCard);
  const moveCardToFoundation = useCoreStore(
    (state) => state.moveCardToFoundation
  );
  const moveCardToDeck = useCoreStore((state) => state.moveCardToDeck);
  const clearSelection = useCoreStore((state) => state.clearSelection);

  // Stack 클릭 핸들러
  const handleStackClick = () => {
    moveStackToWaste();
  };

  // Waste 카드 클릭 핸들러
  const handleWasteCardClick = (card: TrumpCard, index: number) => {
    selectWasteCard(index);
  };

  // Foundation 클릭 핸들러
  const handleFoundationClick = (foundationIndex: number) => {
    if (gameState.selectedCard) {
      moveCardToFoundation(gameState.selectedCard, foundationIndex);
    }
  };

  // Deck 카드 클릭 핸들러
  const handleDeckCardClick = (
    card: TrumpCard,
    index: number,
    deckIndex: number
  ) => {
    if (gameState.selectedCard) {
      moveCardToDeck(gameState.selectedCard, deckIndex);
    } else {
      // Deck 카드 선택 로직 추가 필요
    }
  };

  // 빈 Deck 클릭 핸들러
  const handleEmptyDeckClick = (deckIndex: number) => {
    if (gameState.selectedCard) {
      moveCardToDeck(gameState.selectedCard, deckIndex);
    }
  };

  // Foundation 순서: club, diamond, heart, spade
  const foundationOrder: TrumpCardType[] = [
    "club",
    "diamond",
    "heart",
    "spade",
  ];

  useEffect(() => {
  }, []);

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      height="100vh"
      py={2}
      bgcolor="grey.900"
    >
      <Container
        maxWidth="sm"
        sx={{
          py: 2,
          height: "100%",
          aspectRatio: 412 / 915,
          background: `url(/images/background/background1.jpg) no-repeat center center`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderRadius: 5,
        }}
      >
        <Stack height="100%" gap={10}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <SIconButton title="테마 변경" placement="top" color="default">
              <FaPalette />
            </SIconButton>
            <Stack direction="row" gap={2}>
              <Display title="점수" value={1300} />
              <Display title="남은 카드" value={gameState.stack.length} />
              <Display title="횟수" value={2} />
            </Stack>
            <SIconButton title="설정" placement="top" color="default">
              <GiHamburgerMenu />
            </SIconButton>
          </Stack>

          {/* Body */}
          <Stack gap={5} flex={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Stack & Waste */}
              <Stack direction="row" gap={1}>
                {/* Stack */}
                <Box onClick={handleStackClick} sx={{ cursor: "pointer" }}>
                  <CardDeck
                    direction="row"
                    hasEmpty={gameState.stack.length === 0}
                    items={gameState.stack}
                    // onCardClick={(card, index) =>
                    //   handleStackCardClick(card, index)
                    // }
                    selectedCard={gameState.selectedCard}
                  />
                </Box>

                {/* Waste */}
                <CardDeck
                  direction="row"
                  hasEmpty={gameState.waste.length === 0}
                  items={gameState.waste}
                  onCardClick={(card, index) =>
                    handleWasteCardClick(card, index)
                  }
                  selectedCard={gameState.selectedCard}
                />
              </Stack>

              {/* Temp & Foundation */}
              <Stack direction="row" gap={1.3}>
                {/* Temp */}
                <Box sx={{ position: "relative" }}>
                  <TrumpCard
                    type="club"
                    sign={11}
                    isEmpty={gameState.temp.length === 0}
                  />
                  <AnimatePresence>
                    {gameState.temp.map((card, index) => (
                      <motion.div
                        key={`temp-${index}-${card.type}-${card.sign}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                      >
                        <TrumpCard {...card} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>

                {/* Foundation */}
                <Stack direction="row" gap={0.8}>
                  {foundationOrder.map((type, index) => (
                    <Box
                      key={type}
                      onClick={() => handleFoundationClick(index)}
                      sx={{
                        cursor: gameState.selectedCard ? "pointer" : "default",
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {gameState.foundation[index].length > 0 ? (
                          <motion.div
                            key={`foundation-${index}-${gameState.foundation[index].length}`}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TrumpCard
                              {...gameState.foundation[index][
                                gameState.foundation[index].length - 1
                              ]}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key={`foundation-empty-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <TrumpCard type={type} sign={11} isEmpty />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Stack>

            {/* Deck (ground) */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              {gameState.deck.map((cards, deckIndex) => (
                <CardDeck
                  key={deckIndex}
                  items={cards}
                  hasEmpty={cards.length === 0}
                  onCardClick={(card, index) =>
                    handleDeckCardClick(card, index, deckIndex)
                  }
                  onEmptyClick={() => handleEmptyDeckClick(deckIndex)}
                  selectedCard={gameState.selectedCard}
                />
              ))}
            </Stack>
          </Stack>

          {/* Footer */}
          <Paper
            variant="outlined"
            sx={{ borderRadius: 5, p: 3, backgroundColor: "grey.800" }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <SIconButton title="게임 중지" placement="top" color="default">
                <FaPause />
              </SIconButton>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "grey.700" }}
              />
              <SIconButton title="힌트" placement="top" color="default">
                <FaLightbulb />
              </SIconButton>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "grey.700" }}
              />
              <SIconButton title="새로하기" placement="top" color="default">
                <FaReply />
              </SIconButton>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "grey.700" }}
              />
              <SIconButton title="카드 섞기" placement="top" color="default">
                <FaShuffle />
              </SIconButton>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Stack>
  );
}

export default App;
