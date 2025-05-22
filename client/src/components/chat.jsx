import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Update if your server is hosted elsewhere

function Chat({ rideId }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const messageEndRef = useRef(null);

  // Join room and fetch chat history
  useEffect(() => {
    if (!rideId) return;

    socket.emit('join_room', rideId);
    fetchMessages();

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [rideId]);

  // Fetch chat history from server
  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${rideId}/messages`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setMessages(data); // Assumes server returns an array of messages
    } catch (err) {
      console.error('Failed to fetch chat history:', err.message);
    }
  };

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a message
  const handleSendMessage = () => {
    if (!message.trim()) return;

    const senderName = username.trim() || 'Guest';

    const messageData = {
      rideId,
      sender: senderName,
      text: message,
    };

    socket.emit('send_message', messageData);

    // Optimistically add message to chat
    setMessages((prev) => [
      ...prev,
      { ...messageData, timestamp: new Date().toISOString() },
    ]);

    setMessage('');
  };

  return (
    <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '400px', padding: '1rem' }}>
      <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', backgroundColor: '#f9f9f9' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#888' }}>No messages yet. Be the first to say hi!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
                <strong>{msg.sender}</strong>
                <small style={{ marginLeft: '0.5rem', color: '#666' }}>
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                </small>
              </div>
              <div style={{ backgroundColor: '#e3f2fd', padding: '0.7rem', borderRadius: '10px', maxWidth: '80%' }}>
                <p style={{ margin: 0 }}>{msg.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>

      {!username && (
        <input
          type="text"
          placeholder="Enter your name (optional)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            marginTop: '10px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '100%',
          }}
        />
      )}

      <div style={{ display: 'flex', marginTop: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flexGrow: 1,
            padding: '10px',
            borderRadius: '20px',
            border: '1px solid #ccc',
            marginRight: '10px',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
