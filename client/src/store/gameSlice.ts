// TODO:
// * Don't use emitWithAck
// * Just emit events, update client state
// * Use a rollback event that will reset both players boards if illegal move is caught
// * Add a notification that will be shown on roll backs
// * Use the socket state to block functionality if the socket is disconnected.
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type GameBoard = Array<Array<"x" | "o" | undefined>>;
type TGameState = {
  gameProgress:
    | "idle"
    | "finished"
    | "opponentLeft"
    | "inProgress"
    | "lookingForGame";
  playerCode: "x" | "o" | undefined;
  winner: "x" | "o" | "draw" | "noone";
  isUsersTurn: boolean;
  gameBoard: GameBoard;
};
const initialState: TGameState = {
  gameProgress: "idle",
  playerCode: undefined,
  winner: "noone",
  isUsersTurn: false,
  gameBoard: [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ],
};

const gameSlice = createSlice({
  name: "gameState",
  initialState,
  reducers: {
    reset: () => initialState,
    lookingForGame: (_state) => {
      return {
        ...initialState,
        gameProgress: "lookingForGame",
      };
    },
    startGame: (state, action: PayloadAction<"x" | "o">) => {
      state.gameProgress = "inProgress";
      state.winner = "noone";
      state.playerCode = action.payload;
      state.isUsersTurn = action.payload === "x";
    },
    gameOver: (
      state,
      { payload }: PayloadAction<{ winner: TGameState["winner"] }>,
    ) => {
      state.gameProgress = "finished";
      state.winner = payload.winner;
      state.isUsersTurn = false;
    },
    leaveGame: (_state) => {
      return initialState;
    },
    opponentLeft: (state) => {
      state.gameProgress = "opponentLeft";
      state.winner = "noone";
      state.isUsersTurn = false;
    },
    opponentMoved: (
      state,
      {
        payload,
      }: PayloadAction<{
        rowIndex: number;
        cellIndex: number;
      }>,
    ) => {
      state.gameBoard[payload.rowIndex][payload.cellIndex] =
        state.playerCode === "x" ? "o" : "x";
      state.isUsersTurn = true;
    },
    userMoved: (
      state,
      { payload }: PayloadAction<{ rowIndex: number; cellIndex: number }>,
    ) => {
      state.gameBoard[payload.rowIndex][payload.cellIndex] = state.playerCode;
      state.isUsersTurn = false;
    },
  },
});
export const {
  reset,
  lookingForGame,
  startGame,
  gameOver,
  opponentLeft,
  userMoved,
  opponentMoved,
  leaveGame,
} = gameSlice.actions;
export default gameSlice.reducer;
