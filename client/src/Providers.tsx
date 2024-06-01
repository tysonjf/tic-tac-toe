import { ReactNode } from "react";
import { SocketProvider } from "./socketContext";

export function Providers({ children }: { children: ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
