import { useContext } from "react";
import { SocketContext, TSocketContext } from "./socketContext";

export const useSocket = (): TSocketContext => {
  return useContext(SocketContext);
};
