import { create } from "zustand";

interface UiStore {
  gameBoard: HTMLDivElement | null;
  setGameBoard: (gameBoard: HTMLDivElement | null) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  gameBoard: null,
  setGameBoard: (gameBoard) => set({ gameBoard }),
}));
