const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

/**
 * Call Python ML service for exoplanet habitability prediction
 * @param {Object} features - Planet and star features
 * @param {number} features.radius - Planet radius (Earth radii)
 * @param {number} features.orbital_period - Orbital period (days)
 * @param {number} features.star_mass - Host star mass (solar masses)
 * @param {number} features.star_teff - Star effective temperature (K)
 * @param {number} features.semi_major_axis - Orbital distance (AU)
 * @returns {Promise<Object>} Prediction result from ML service
 */
const predict = async (features) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
            radius: features.radius,
            orbital_period: features.orbital_period,
            star_mass: features.star_mass,
            star_teff: features.star_teff,
            semi_major_axis: features.semi_major_axis,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        if (error.response) {
            const detail = error.response.data.detail;
            const message = Array.isArray(detail)
                ? detail.map((d) => d.msg).join('; ')
                : detail || error.response.statusText;

            return {
                success: false,
                error: `ML service error: ${message}`,
                statusCode: error.response.status,
            };
        } else if (error.request) {
            return {
                success: false,
                error: 'ML service unavailable',
                statusCode: 503,
            };
        } else {
            return {
                success: false,
                error: `Request error: ${error.message}`,
                statusCode: 500,
            };
        }
    }
};

/**
 * Check ML service health
 * @returns {Promise<Object>} Health status from ML service
 */
const checkHealth = async () => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`);
        return { success: true, data: response.data };
    } catch {
        return { success: false, error: 'ML service unreachable' };
    }
};

module.exports = { predict, checkHealth };
