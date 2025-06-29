const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const contestRoutes = require('./routes/contestRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use('/api/contest', contestRoutes);

module.exports = app;
