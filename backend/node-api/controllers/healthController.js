const mlService = require('../src/services/mlService');

const getHealth = async (req, res) => {
    const mlHealth = await mlService.checkHealth();

    res.json({
        success: true,
        data: {
            status: "OK",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            ml_service: mlHealth.success ? mlHealth.data : { status: "UNAVAILABLE" },
        },
        error: null,
    });
};

module.exports = { getHealth };
