const express = require('express');
const authRoutes = require('./auth.routes');
const transactionRoutes = require('./transaction.routes');
const budgetRoutes = require('./budget.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

// Mount modules
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/analytics', analyticsRoutes);

// We will mount other modules (transactions, budgets, analytics) in subsequent phases

module.exports = router;
