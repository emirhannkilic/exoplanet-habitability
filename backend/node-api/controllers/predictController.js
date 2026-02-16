const mlService = require('../src/services/mlService');

const FEATURE_RULES = {
    radius:          { label: 'Planet radius (Earth radii)',        min: 0 },
    orbital_period:  { label: 'Orbital period (days)',              min: 0 },
    star_mass:       { label: 'Host star mass (solar masses)',      min: 0 },
    star_teff:       { label: 'Star effective temperature (K)',     min: 0 },
    semi_major_axis: { label: 'Orbital distance (AU)',              min: 0 },
};

const REQUIRED_FIELDS = Object.keys(FEATURE_RULES);

const predict = async (req, res) => {
    try {
        const missing = REQUIRED_FIELDS.filter((f) => req.body[f] === undefined || req.body[f] === null);
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: `Missing required fields: ${missing.join(', ')}`,
            });
        }

        const errors = [];
        const features = {};

        for (const field of REQUIRED_FIELDS) {
            const value = Number(req.body[field]);
            if (isNaN(value)) {
                errors.push(`${field} must be a number`);
            } else if (value <= FEATURE_RULES[field].min) {
                errors.push(`${field} must be greater than ${FEATURE_RULES[field].min}`);
            } else {
                features[field] = value;
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: errors.join('; '),
            });
        }

        // --- ML service ---
        const mlResult = await mlService.predict(features);

        if (!mlResult.success) {
            return res.status(mlResult.statusCode || 500).json({
                success: false,
                data: null,
                error: mlResult.error,
            });
        }

        // --- Build response ---
        const { predicted_mass, predicted_temp, esi_score, habitability, components } = mlResult.data;

        res.json({
            success: true,
            data: {
                input: features,
                prediction: {
                    mass: predicted_mass,
                    temperature: predicted_temp,
                    esi_score: esi_score,
                    habitability: habitability,
                },
                components: components,
                timestamp: new Date().toISOString(),
            },
            error: null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: `Internal server error: ${error.message}`,
        });
    }
};

module.exports = { predict };
