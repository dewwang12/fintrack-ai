const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply auth check to all analytics routes
router.use(protect);

router.get('/summary', analyticsController.getSummary);

module.exports = router;
