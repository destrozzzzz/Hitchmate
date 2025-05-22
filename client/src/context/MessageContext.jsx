import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message', handleMessage);
    };
  }, [socket]);

  const fetchMessages = async (rideId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/${rideId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (rideId, sender, text) => {
    const message = { rideId, sender, text };
    if (socket) {
      socket.emit('send_message', message);
    }
  };

  return (
    <MessageContext.Provider value={{ messages, loading, fetchMessages, sendMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
