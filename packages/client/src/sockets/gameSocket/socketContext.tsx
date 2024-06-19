import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@tic-tac-toe/shared/socketTypes";

const URL = import.meta.env.DEV ? 'http://localhost:3000' : import.meta.env.VITE_API_URL as string;
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
