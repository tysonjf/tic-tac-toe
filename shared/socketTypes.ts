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
  message: (message: string) => void;
  lookingForGame: (cb: (result: { success: boolean }) => void) => void;
  leaveGame: (cb: (result: { success: true }) => void) => void;
  makeMove: (
    row: number,
    cell: number,
    playerCode: "x" | "o",
    cb: (move: { row: number; cell: number; success: boolean }) => void,
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}
