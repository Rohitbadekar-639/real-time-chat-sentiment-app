import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Container, TextField, Button, Typography, Box, List, ListItem, ListItemText, ListItemButton, Paper, Grid, IconButton, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { Picker } from 'emoji-mart';
import moment from 'moment';

const socket = io(process.env.REACT_APP_API_URL, {
  auth: {
    token: localStorage.getItem('token')
  }
});

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [room, setRoom] = useState('General');
  const [rooms] = useState(['General', 'Random', 'Tech']);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    } else {
      socket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.on('messageDeleted', (messageId) => {
        setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== messageId));
      });

      socket.on('onlineUsers', (users) => {setOnlineUsers(users);
      });
  
      socket.on('userTyping', ({ username, isTyping }) => {
        if (isTyping) {
          setTypingUsers(prev => [...new Set([...prev, username])]);
        } else {
          setTypingUsers(prev => prev.filter(user => user !== username));
        }
      });
  
      joinRoom(room);
  
      return () => {
        socket.off('message');
        socket.off('messageDeleted');
        socket.off('onlineUsers');
        socket.off('userTyping');
      };
    }
  }, [navigate, room]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const joinRoom = (newRoom) => {
    socket.emit('joinRoom', newRoom);
    setRoom(newRoom);
    setMessages([]);
  };
  
  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage) {
      socket.emit('sendMessage', { text: inputMessage, room });
      setInputMessage('');
      setIsTyping(false);
      socket.emit('typing', { room, isTyping: false });
    }
  };
  
  const deleteMessage = (messageId) => {
    socket.emit('deleteMessage', messageId);
  };
  
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { room, isTyping: true });
    }
  };
  
  const handleEmojiSelect = (emoji) => {
    setInputMessage(prevMessage => prevMessage + emoji.native);
    setShowEmojiPicker(false);
  };
  
  const getSentimentColor = (sentiment) => {
    if (sentiment > 0) return 'success';
    if (sentiment < 0) return 'error';
    return 'default';
  };
  
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
            <Typography variant="h6">Rooms</Typography>
            <List>
            {rooms.map((r) => (
              <ListItemButton key={r} onClick={() => joinRoom(r)} selected={r === room}>
                <ListItemText primary={r} />
              </ListItemButton>
            ))}
            </List>
            <Typography variant="h6">Online Users</Typography>
            <List>
              {onlineUsers.map((user) => (
                <ListItem key={user}>
                  <ListItemText primary={user} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper elevation={3} sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom>
              Chat Room: {room}
            </Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
              {messages.map((message, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">
                    {message.user.username} - {moment(message.createdAt).format('LT')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">{message.text}</Typography>
                    <Chip 
                      size="small" 
                      label={message.sentiment} 
                      color={getSentimentColor(message.sentiment)} 
                      sx={{ ml: 1 }} 
                    />
                    <IconButton size="small" onClick={() => deleteMessage(message._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            {typingUsers.length > 0 && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </Typography>
            )}
            <form onSubmit={sendMessage} style={{ display: 'flex' }}>
              <TextField
                fullWidth
                value={inputMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                variant="outlined"
                size="small"
              />
              <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <EmojiEmotionsIcon />
              </IconButton>
              <Button type="submit" variant="contained" endIcon={<SendIcon />}>
                Send
              </Button>
            </form>
            {showEmojiPicker && (
              <Box sx={{ position: 'absolute', bottom: '80px', right: '20px' }}>
                <Picker onSelect={handleEmojiSelect} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
  }
  
  export default Chat;