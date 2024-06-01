import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@shared/socketTypes";
const URL = import.meta.env.PROD
  ? import.meta.env.API_URL
  : "http://localhost:3000";

export type TSocketContext = Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null;
export const SocketContext = createContext<TSocketContext>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<TSocketContext>(null);

  useEffect(() => {
    const socket: Socket = io(URL);
    setSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
