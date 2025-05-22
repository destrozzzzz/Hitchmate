import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  return socket;
};
