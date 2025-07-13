// src/games/index.ts
import untilBomb from "./untilBomb/game";
import guessNumber from "./guessNumber/game";

export interface Game {
  id: string;
  name: string;
  description: string;
  cover: string;
  component: any;
}

export const gameRegistry: Record<string, Game> = {
  [untilBomb.id]: untilBomb,
  [guessNumber.id]: guessNumber,
};
