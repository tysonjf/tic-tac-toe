import { useAppSelector } from "@/store/storeHooks";
import { cn } from "@/util/cn";

export default function ScoreBoard() {
  const { username, opponentUsername, scoreHistory } = useAppSelector(({ game }) => game);
  const usersScore = scoreHistory.user.reduce((a, b) => b === 'win' ? a += 1 : a, 0)
  const opponentScore = scoreHistory.opponent.reduce((a, b) => b === 'win' ? a += 1 : a, 0)
  return (
    <div className="flex w-full justify-stretch bg-slate-200 rounded-lg">
      <div className="w-full border-r border-slate-300">
        <div className="border border-b-slate-300 bg-emerald-200 font-bold px-2">
          {username}
          <span className="pl-2">score: {usersScore}</span>
        </div>
        <div className="p-2">
          {scoreHistory.user.map((winLoseDraw, i) => (
            < WinLoseDraw isUser key={i} score={winLoseDraw} />
          ))}
        </div>
      </div>
      <div className="w-full">
        <div className="border border-b-slate-300 bg-rose-200 font-bold px-2">
          {opponentUsername}
          <span className="pl-2">score: {opponentScore}</span>
        </div>
        <div className="p-2">
          {scoreHistory.opponent.map((winLoseDraw, i) => (
            < WinLoseDraw key={i} score={winLoseDraw} />
          ))}
        </div>
      </div>
    </div>
  );
}
const WinLoseDraw = (props: { score: 'win' | 'lose' | 'draw'; isUser?: boolean }) => {
  const isWin = props.score === 'win' && props.isUser
  const isLose = props.score === 'lose' && props.isUser
  const isDraw = props.score === 'draw' && props.isUser
  return <div
    className={cn({
      'text-slate-600': !props.isUser,
      'text-emerald-500': isWin,
      'text-rose-500': isLose,
      'text-purple-500': isDraw
    })}
  >{props.score}</div>
}
