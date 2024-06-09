import { useAppSelector } from "@/store/storeHooks";
import { cn } from "@/util/cn";

export default function TitleSection() {
  const gameProgress = useAppSelector(({ game }) => game.gameProgress);

  if (gameProgress === "idle") {
    return <Idle />;
  }
  if (gameProgress === "lookingForGame") {
    return <LookingForGame />;
  }
  if (gameProgress === "inProgress") {
    return <InProgress />;
  }
  if (gameProgress === "opponentLeft") {
    return <OpponentLeft />;
  }
  if (gameProgress === "finished") {
    return <GameOver />;
  }
}
const Idle = () => {
  return (
    <div>
      <h1>Ready to play? Click look for a game.</h1>
    </div>
  );
};
const LookingForGame = () => {
  return (
    <div>
      <h1 className="animate-pulse">Looking for game...</h1>
    </div>
  );
};
const InProgress = () => {
  const isUsersTurn = useAppSelector(({ game }) => game.isUsersTurn);

  return (
    <div
      className={cn(
        "py-2 px-4 flex flex-col items-center gap-2 rounded w-full",
        {
          "bg-emerald-300": isUsersTurn,
          "bg-rose-300": !isUsersTurn,
        },
      )}
    >
      <h1>Let's go, game has started!</h1>
    </div>
  );
};
const GameOver = () => {
  const { winner, playerCode } = useAppSelector(({ game }) => ({
    winner: game.winner,
    playerCode: game.playerCode,
  }));
  const winnerMessage =
    winner === "x" || winner === "o"
      ? winner === playerCode
        ? "You won!"
        : "You lost!"
      : winner === "draw"
        ? "It was a draw!"
        : "Noone won...";
  return (
    <div
      className={cn("py-2 px-4 text-center rounded bg-slate-300", {
        "bg-emerald-300": winner === playerCode,
      })}
    >
      <h1>Game over!</h1>
      <p>{winnerMessage}</p>
    </div>
  );
};
const OpponentLeft = () => {
  return (
    <div className="bg-slate-300 rounded py-2 px-4 text-center">
      <h1>Uh oh. Your opponent left...</h1>
      <p>Look for a new game?</p>
    </div>
  );
};
