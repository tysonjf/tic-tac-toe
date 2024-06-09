type FoundGame =
  | {
      success: true;
      data: {
        roomId: string;
        playerCode: "x" | "o";
      };
    }
  | { success: false; data?: never };
export interface ServerToClientEvents {
  playerMoved: (row: number, cell: number) => void;
  newGame: (playerCode: "x" | "o") => void;
  gameStarted: (player: { roomId: string; playerCode: "x" | "o" }) => void;
  opponentMoved: (move: {
    rowIndex: number;
    cellIndex: number;
    playerCode: "x" | "o";
  }) => void;
  thisPlayersMove: (playerCode: "x" | "o") => void;
  gameOver: (data: { complete: boolean; winner: "x" | "o" | "draw" }) => void;
  opponentLeftGame: () => void;
}

export interface ClientToServerEvents {
  testEvent: () => void;
  message: (message: string) => void;
  lookingForGame: (cb: (result: FoundGame) => void) => void;
  leaveGame: () => void;
  makeMove: (
    rowIndex: number,
    cellIndex: number,
    playerCode: "x" | "o",
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}
