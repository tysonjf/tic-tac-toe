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
  | "lookingForGame" | "waitingForOpponent" | 'opponentRequestingReplay'
  playerCode: "x" | "o" | undefined;
  username: string;
  opponentUsername: string;
  winner: "x" | "o" | "draw" | "noone";
  isUsersTurn: boolean;
  gameBoard: GameBoard;
  scoreHistory: {
    opponent: Array<'win' | 'lose' | 'draw'>
    user: Array<'win' | 'lose' | 'draw'>
  }
};
const initialState: TGameState = {
  gameProgress: "idle",
  playerCode: undefined,
  username: "",
  opponentUsername: "",
  winner: "noone",
  isUsersTurn: false,
  gameBoard: [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ],
  scoreHistory: {
    opponent: [],
    user: []
  }
};

const gameSlice = createSlice({
  name: "gameState",
  initialState,
  reducers: {
    reset: () => initialState,
    requestReplayOpponent: (state) => {
      state.gameProgress = 'waitingForOpponent'
    },
    opponentRequestingReplay: (state) => {
      state.gameProgress = 'opponentRequestingReplay'
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    lookingForGame: (state) => {
      return {
        ...initialState,
        gameProgress: "lookingForGame",
        username: state.username,
      };
    },
    startGame: (
      state,
      action: PayloadAction<{
        playerCode: "x" | "o";
        opponentUsername: string;
      }>,
    ) => {
      state.gameBoard = [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
      ]
      state.gameProgress = "inProgress";
      state.winner = "noone";
      state.playerCode = action.payload.playerCode;
      state.isUsersTurn = action.payload.playerCode === "x";
      state.opponentUsername = action.payload.opponentUsername;
    },
    gameOver: (
      state,
      { payload }: PayloadAction<{ winner: TGameState["winner"] }>,
    ) => {
      const isWinnerUser = payload.winner === state.playerCode
      const isDraw = payload.winner === 'draw'
      const isNoone = payload.winner === 'noone'
      if (isWinnerUser) {
        state.scoreHistory.opponent.push('lose')
        state.scoreHistory.user.push('win')
      } else if (isDraw || isNoone) {
        state.scoreHistory.opponent.push('draw')
        state.scoreHistory.user.push('draw')
      } else {
        state.scoreHistory.opponent.push('win')
        state.scoreHistory.user.push('lose')
      }
      state.gameProgress = "finished";
      state.winner = payload.winner;
      state.isUsersTurn = false;
    },
    leaveGame: (state) => {
      return { ...initialState, username: state.username };
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
  setUsername,
  requestReplayOpponent,
  opponentRequestingReplay
} = gameSlice.actions;
export default gameSlice.reducer;
