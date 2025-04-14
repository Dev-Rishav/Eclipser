// reducers/socketReducer.js
import { io } from "socket.io-client";

let socket = null;

const initialState = {
  instance: null,
  connected: false,
};

const socketReducer = (state = initialState, action) => {
  switch (action.type) {
    case "INIT_SOCKET":
      if (!socket) {
        socket = io("http://localhost:3000", {
          transports: ["websocket"],
          autoConnect: false,
        });
      }
      return { ...state, instance: socket };

    case "CONNECT_SOCKET":
      if (socket && !state.connected) {
        socket.connect();
        socket.emit("register", action.payload); // user._id
        return { ...state, connected: true };
      }
      return state;

    case "DISCONNECT_SOCKET":
      if (socket && state.connected) {
        socket.disconnect();
        return { ...state, connected: false };
      }
      return state;

    default:
      return state;
  }
};

export default socketReducer;
