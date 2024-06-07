import { Provider as StoreProvider } from "react-redux";
import { ReactNode } from "react";
import { store } from "@store/store";

export function Providers({ children }: { children: ReactNode }) {
  return <StoreProvider store={store}>{children}</StoreProvider>;
}
