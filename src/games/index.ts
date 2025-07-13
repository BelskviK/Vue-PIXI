// src/games/index.ts
import untilGuess from "./untilGuess/game";
import guessNumber from "./guessNumber/game";

export interface Game {
  id: string;
  name: string;
  description: string;
  cover: string;
  component: any;
}

export const gameRegistry: Record<string, Game> = {
  [untilGuess.id]: untilGuess,
  [guessNumber.id]: guessNumber,
};
