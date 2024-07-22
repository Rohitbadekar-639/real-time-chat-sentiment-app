# Advanced Real-Time Chat Application with Sentiment Analysis

## Overview

This project is a full-stack, real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO. It features user authentication, multiple chat rooms, sentiment analysis, and a responsive UI.

[Live Demo](https://chat-sentiment-app-frontend.vercel.app) 

## Features

- User Authentication (Sign up / Sign in)
- Multiple Chat Rooms
- Real-time Messaging
- Message Sentiment Analysis
- Emoji Support
- Message Deletion
- Typing Indicators
- Online Users List
- Responsive Design

## Technologies Used

### Frontend
- React.js
- Material-UI
- Socket.IO Client
- Axios for HTTP requests
- React Router for navigation
- Emoji-Mart for emoji picker
- Moment.js for time formatting

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens (JWT) for authentication
- Bcrypt for password hashing
- Sentiment for message sentiment analysis

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Installation

1. Clone the repository

git clone https://github.com/your-username/advanced-chat-app.git
cd advanced-chat-app

2. Install server dependencies

cd server
npm install

3. Install client dependencies

cd ../client
npm install

4. Set up environment variables
Create a `.env` file in the server directory with the following:

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

5. Start the server

cd ../server
node server.js

6. Start the client

cd ../client
npm start

7. Open `http://localhost:3000` in your browser

## Usage

1. Register a new account or log in
2. Select a chat room to join
3. Start chatting!
4. Use the emoji picker to add emojis to your messages
5. View sentiment analysis for each message
6. See who's online and who's currently typing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

Project Link: [https://github.com/your-username/advanced-chat-app](https://github.com/Rohitbadekar-639/real-time-chat-sentiment-app)
