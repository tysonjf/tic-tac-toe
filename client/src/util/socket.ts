import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@shared/socketTypes";
// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.PROD
  ? import.meta.env.API_URL
  : "http://localhost:3000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(URL);
