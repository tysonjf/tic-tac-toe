import { useEffect } from "react";
import { useSocket } from "@sockets/gameSocket/useSocket";
import { cn } from "../util/cn";
import { useAppDispatch, useAppSelector } from "@/store/storeHooks";
import {
  gameOver,
  lookingForGame,
  opponentMoved,
  startGame,
  userMoved,
  leaveGame,
  opponentLeft,
  requestReplayOpponent,
  opponentRequestingReplay,
} from "@/store/gameSlice";
import assert from "@/util/assert";
import TitleSection from "./GameTitle";
import GameUsernameSignup from "./GameUsernameSignup";
import ScoreBoard from "./GameScoreBoard";

function GameScreen() {
  const ws = useSocket();
  const username = useAppSelector(({ game }) => game.username);
  const dispatch = useAppDispatch();
  useEffect(() => {
    ws?.on("gameStarted", (data) => {
      dispatch(
        startGame({
          playerCode: data.playerCode,
          opponentUsername: data.opponentUsername,
        }),
      );
    });
    ws?.on("gameOver", (data) => {
      if (data.complete) {
        dispatch(gameOver({ winner: data.winner }));
      }
    });
    ws?.on("opponentLeftGame", () => {
      dispatch(opponentLeft());
    });
    ws?.on("opponentWantsToPlayAgain", () => {
      dispatch(opponentRequestingReplay())
    })

    return () => {
      ws?.off("opponentLeftGame");
      ws?.off("gameOver");
      ws?.off("gameStarted");
    };
  }, [ws]);
  return (
    <div>
      {username.length <= 0 ? (
        <GameUsernameSignup />
      ) : (
        <>
          <div className="fixed top-0 left-0 w-full">
            <TitleSection />
          </div>
          <div className="pt-24 flex flex-col w-full items-center gap-8">
            <GameBoard />
            <ControlPanel />
          </div>
          <div className="pt-6 max-w-lg mx-auto ">
            <ScoreBoard />
          </div>
        </>
      )}
    </div>
  );
}

export default GameScreen;

function ControlPanel() {
  const ws = useSocket();
  const gameProgress = useAppSelector(({ game }) => game.gameProgress);
  const dispatch = useAppDispatch();

  const lookForGame = async () => {
    if (gameProgress === "inProgress") {
      ws?.emit("leaveGame");
    }
    dispatch(lookingForGame());
    const res = await ws?.emitWithAck("lookingForGame");
    if (res?.success) {
      dispatch(
        startGame({
          playerCode: res.data.playerCode,
          opponentUsername: res.data.opponentUsername,
        }),
      );
    }
  };
  const handleLeaveGame = () => {
    ws?.emit("leaveGame");
    dispatch(leaveGame());
  };
  const handlePlayAgain = () => {
    ws?.emit('playerCurrentOpponentAgain')
    dispatch(requestReplayOpponent())
  }

  const showReplayButton = gameProgress === 'finished' || gameProgress === 'opponentRequestingReplay' || gameProgress === 'waitingForOpponent'
  const disableLeaveGame = gameProgress === 'idle'
  return (
    <div className="flex flex-col gap-4 ">
      {showReplayButton ?
        <button
          disabled={gameProgress === 'waitingForOpponent'}
          onClick={handlePlayAgain}
          className={cn("bg-violet-500 px-4 py-2 rounded [&:not(:disabled)]:hover:bg-violet-400", {
            '[&:not(:hover)]:animate-pulse': gameProgress === 'waitingForOpponent' || gameProgress === 'opponentRequestingReplay'
          })}
        >
          {gameProgress === 'finished' ? 'play again?' : gameProgress === 'waitingForOpponent' ? 'waiting for opponent' : 'accept opponents rematch?'}
        </button>
        : null}
      <button
        onClick={lookForGame}
        className="py-2 px-4 bg-green-300 hover:bg-green-200 rounded transition"
      >
        Look for new game
      </button>
      <button
        disabled={disableLeaveGame}
        onClick={handleLeaveGame}
        className="py-2 px-4 bg-rose-300 [&:not(:disabled)]:hover:bg-rose-200 disabled:bg-gray-400 rounded transition"
      >
        leave game
      </button>
    </div>
  );
}

function GameBoard() {
  const ws = useSocket();
  const game = useAppSelector(({ game }) => game);
  const dispatch = useAppDispatch();
  useEffect(() => {
    ws?.on("opponentMoved", ({ rowIndex, cellIndex }) => {
      dispatch(opponentMoved({ rowIndex, cellIndex }));
    });
    return () => {
      ws?.off("opponentMoved");
    };
  }, [ws]);

  return (
    <div>
      {game.gameBoard.map((row, rowIndex) => {
        return (
          <div key={rowIndex} className="flex">
            {row.map((cell, cellIndex) => {
              return (
                <GameSquare
                  key={cellIndex}
                  rowIndex={rowIndex}
                  cellIndex={cellIndex}
                  state={cell}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
function GameSquare({
  state,
  rowIndex,
  cellIndex,
}: {
  state: "x" | "o" | undefined;
  rowIndex: number;
  cellIndex: number;
}) {
  const ws = useSocket();
  const game = useAppSelector(({ game }) => game);
  const dispatch = useAppDispatch();
  const handleMakeMove = () => {
    assert(game.playerCode, "Player code is not defined");
    ws?.emit("makeMove", rowIndex, cellIndex, game.playerCode);
    dispatch(userMoved({ rowIndex, cellIndex }));
  };
  const disabled =
    !game.isUsersTurn ||
    game.gameProgress === "finished" ||
    game.gameProgress === "idle" ||
    game.gameProgress === "lookingForGame" ||
    game.gameProgress === "opponentLeft" ||
    Boolean(state);
  return (
    <button
      disabled={disabled}
      onClick={handleMakeMove}
      className={cn(
        "size-24 m-1 rounded-md text-lg [&:not(:disabled)]:hover:bg-slate-700 [&:not(:disabled)]:hover:scale-110 transition-all",
        {
          "bg-pink-200": state !== game.playerCode,
          "bg-emerald-200": state === game.playerCode && game.playerCode,
          "bg-slate-800": !state,
        },
      )}
    >
      {state}
    </button>
  );
}
