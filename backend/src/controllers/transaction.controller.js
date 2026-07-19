const transactionService = require('../services/transaction.service');
const aiService = require('../services/ai.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// POST /api/v1/transactions
// Creates a new transaction (income/expense) with optional receipt attachment
const create = asyncHandler(async (req, res, next) => {
  const transaction = await transactionService.createTransaction(
    req.user._id,
    req.body,
    req.file // Attached by upload middleware (Multer)
  );

  res.status(201).json({
    success: true,
    data: { transaction },
  });
});

// GET /api/v1/transactions
// Fetch user's transactions with search, category filtering, and pagination
const getAll = asyncHandler(async (req, res, next) => {
  const result = await transactionService.getTransactions(req.user._id, req.query);

  res.status(200).json({
    success: true,
    data: result,
  });
});

// GET /api/v1/transactions/:id
// Get details for a single transaction owned by the user
const getOne = asyncHandler(async (req, res, next) => {
  const transaction = await transactionService.getTransactionById(
    req.user._id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { transaction },
  });
});

// PUT /api/v1/transactions/:id
// Update transaction details and optionally replace/upload receipt
const update = asyncHandler(async (req, res, next) => {
  const transaction = await transactionService.updateTransaction(
    req.user._id,
    req.params.id,
    req.body,
    req.file
  );

  res.status(200).json({
    success: true,
    data: { transaction },
  });
});

// DELETE /api/v1/transactions/:id
// Delete a transaction from DB and remove associated asset from Cloudinary
const remove = asyncHandler(async (req, res, next) => {
  const result = await transactionService.deleteTransaction(
    req.user._id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// POST /api/v1/transactions/scan
// Process file buffer through Gemini API and return parsed structured details
const scan = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a receipt image or PDF file to scan.', 400));
  }

  const parsedData = await aiService.parseReceipt(
    req.file.buffer,
    req.file.mimetype
  );

  res.status(200).json({
    success: true,
    data: parsedData,
  });
});

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
  scan,
};
