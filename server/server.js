require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Sentiment = require('sentiment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const MessageSchema = new mongoose.Schema({
  text: String,
  sentiment: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  room: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

const sentiment = new Sentiment();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User registration
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword
    });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// User login
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(400).send('Invalid credentials');
  }
});

// Get messages for a room
app.get('/messages/:room', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).populate('user', 'username');
    res.json(messages);
  } catch (error) {
    res.status(500).send('Error fetching messages');
  }
});

const onlineUsers = new Set();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.decoded = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('New client connected');
  onlineUsers.add(socket.decoded.username);
  io.emit('onlineUsers', Array.from(onlineUsers));

  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  socket.on('sendMessage', async ({ text, room }) => {
    try {
      const sentimentResult = sentiment.analyze(text);
      const newMessage = new Message({
        text,
        sentiment: sentimentResult.score,
        user: socket.decoded.id,
        room
      });
      await newMessage.save();
      const populatedMessage = await Message.findById(newMessage._id).populate('user', 'username');
      io.to(room).emit('message', populatedMessage);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  socket.on('deleteMessage', async (messageId) => {
    try {
      await Message.findByIdAndDelete(messageId);
      io.emit('messageDeleted', messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('userTyping', { username: socket.decoded.username, isTyping: data.isTyping });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.decoded.username);
    io.emit('onlineUsers', Array.from(onlineUsers));
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));