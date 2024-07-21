import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Message from './Message';

const socket = io(process.env.REACT_APP_SERVER_URL);

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("Attempting to connect to server...");
    socket.on('connect', () => {
      console.log("Connected to server!");
    });

    socket.on('message', (message) => {
      console.log('Received message from server:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage) {
      console.log('Sending message:', inputMessage);
      socket.emit('sendMessage', { text: inputMessage });
      setInputMessage('');
    }
  };

  return (
    <div>
      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ width: '70%', marginRight: '10px', padding: '5px' }}
        />
        <button type="submit" style={{ padding: '5px 10px' }}>Send</button>
      </form>
    </div>
  );
}

export default Chat;