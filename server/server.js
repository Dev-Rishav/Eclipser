const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./configs/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/greet', (req, res) => {
    res.send('Hello, World!');
    });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});