require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Sentiment = require('sentiment');

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

const MessageSchema = new mongoose.Schema({
  text: String,
  sentiment: Number,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

const sentiment = new Sentiment();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('sendMessage', async (message) => {
    try {
      console.log('Received message:', message);
      const sentimentResult = sentiment.analyze(message.text);
      const newMessage = new Message({
        text: message.text,
        sentiment: sentimentResult.score
      });
      await newMessage.save();
      console.log('Saved message:', newMessage);
      io.emit('message', newMessage);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));