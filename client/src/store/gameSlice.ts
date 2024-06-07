// TODO:
// * Don't use emitWithAck
// * Just emit events, update client state
// * Use a rollback event that will reset both players boards if illegal move is caught
// * Add a notification that will be shown on roll backs
// * Use the socket state to block functionality if the socket is disconnected.
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useSocket } from "@sockets/gameSocket/useSocket";
import { useAppDispatch } from "./storeHooks";
import { useAsync } from "./hooks/useAsync";

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

export const useLookForGame = () => {
  const ws = useSocket();
  const dispatch = useAppDispatch();
  const async = useAsync({
    queryFn: async () => {
      return await ws?.emitWithAck("lookingForGame");
    },
    onFulfilled: (data) => {
      if (data.success) {
        dispatch(lookingForGame());
      }
    },
  });
  return async;
};

const gameSlice = createSlice({
  name: "gameState",
  initialState,
  reducers: {
    reset: () => initialState,
    lookingForGame: (state) => {
      state.gameProgress = "lookingForGame";
      return state;
    },
    startGame: (state, action: PayloadAction<"x" | "o">) => {
      return {
        ...state,
        gameProgress: "inProgress",
        winner: "noone",
        playerCode: action.payload,
        isUsersTurn: action.payload === "x",
      };
    },
    opponentMoved: (
      state,
      action: PayloadAction<{
        rowIndex: number;
        cellIndex: number;
        playerCode: "x" | "o";
      }>,
    ) => {
      state.gameBoard[action.payload.rowIndex][action.payload.cellIndex] =
        action.payload.playerCode;
      return { ...state, isUsersTurn: true };
    },
    makeMove: (
      state,
      action: PayloadAction<{ rowIndex: number; cellIndex: number }>,
    ) => {
      const payload = action.payload;
      state.gameBoard[payload.rowIndex][payload.cellIndex] = state.playerCode;
      return { ...state, isUsersTurn: !state.isUsersTurn };
    },
  },
});
export const { reset, startGame, makeMove, opponentMoved, lookingForGame } =
  gameSlice.actions;
export default gameSlice.reducer;
