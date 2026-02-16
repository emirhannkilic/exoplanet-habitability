const express = require('express');
const router = express.Router();
const { predict } = require('../controllers/predictController');

router.post('/', predict);

module.exports = router;