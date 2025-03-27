const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./configs/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const cors=require('cors');
const { initSocket } = require("./configs/socket");
const {createServer} = require("http");

const {Server}= require('socket.io');

dotenv.config();

connectDB();

const app = express();
const server = createServer(app);


initSocket(server); // Initialize WebSockets


app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/posts',postRoutes);

app.use('/greet', (req, res) => {
    res.send('Hello, World!');
    });


    

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});