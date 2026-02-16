const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

app.use(express.json());

const healthRoutes = require('./routes/health');
const predictRoutes = require('./routes/predict');

app.get("/test", (req, res) => {
    res.send("Server is running");
});

app.use('/api/health', healthRoutes);
app.use('/api/predict', predictRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});