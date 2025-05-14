import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// You can replace the URL with your production backend URL if necessary
const socket = io('http://localhost:5000'); // Your server URL

function Chat({ rideId, user }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);
  
  useEffect(() => {
    // Fetch initial messages when the component is mounted (older messages)
    fetchMessages();

    // Join the specific room for the ride
    socket.emit('join_room', rideId);

    // Listen for incoming messages in the ride room
    socket.on('receive_message', (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      // Clean up event listeners when component unmounts
      socket.off('receive_message');
    };
  }, [rideId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/messages`);
      const data = await response.json();
      setMessages(data.reverse()); // Reverse to show older messages first
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const messageData = {
        rideId,
        sender: user._id, // Send only the user's ID if you want to populate name on the backend
        text: message,
        timestamp: new Date(),
      };
      // Emit message to the backend and broadcast to others in the room
      socket.emit('send_message', messageData);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: user.name, text: message, timestamp: new Date() }, // Use user's name directly in the frontend
      ]);
      setMessage(''); // Clear the message input after sending
    }
  };

  // Scroll to the bottom whenever a new message is added
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container" style={{ width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', height: '400px' }}>
      <div className="messages" style={{ flexGrow: 1, overflowY: 'scroll', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              {/* Placeholder for user avatars - replace with actual user profile picture URLs */}
              <img
                src={`https://www.avatarapi.com/${msg.sender}`} 
                alt="avatar" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} 
              />
              <strong>{msg.sender}</strong> {/* Ensure sender is either string or has 'name' */}
              <small style={{ marginLeft: '10px', color: '#777' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '8px', maxWidth: '80%' }}>
              <p style={{ margin: 0 }}>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} /> {/* This ensures scrolling to bottom */}
      </div>

      <div className="message-input" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          style={{
            width: '85%',
            padding: '10px',
            marginRight: '10px',
            borderRadius: '20px',
            border: '1px solid #ccc',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
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
