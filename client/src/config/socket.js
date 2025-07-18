import { io } from "socket.io-client";
import { API_CONFIG } from './api.js';

const socket = io(API_CONFIG.SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
