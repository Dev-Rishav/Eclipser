export const initSocket = () => ({
    type: "INIT_SOCKET",
  });
  
  export const connectSocket = (userId) => ({
    type: "CONNECT_SOCKET",
    payload: userId,
  });
  
  export const disconnectSocket = () => ({
    type: "DISCONNECT_SOCKET",
  });
  