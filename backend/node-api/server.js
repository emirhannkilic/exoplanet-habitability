const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Middleware - JSON parser
app.use(express.json());

// Routes
const healthRoutes = require('./routes/health');
const predictRoutes = require('./routes/predict');

// Test endpoint
app.get("/test", (req, res) => {
    res.send("Server is running");
});

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/predict', predictRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});