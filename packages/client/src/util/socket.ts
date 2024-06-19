import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@tic-tac-toe/shared/socketTypes";
// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.PROD
  ? import.meta.env.API_URL
  : "http://localhost:3000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(URL);
