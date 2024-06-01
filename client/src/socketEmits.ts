import { useMutation } from "react-query";
import { useSocket } from "./useSocket";
export const useMakeMove = () => {
  const WS = useSocket();
  const mutateFunc = async (move: {
    rowIndex: number;
    cellIndex: number;
    playerCode: string;
  }) => {
    return await WS?.emitWithAck("makeMove", move.rowIndex, move.cellIndex);
  };
  return useMutation({ mutationKey: ["makeMove"], mutationFn: mutateFunc });
};
