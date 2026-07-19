const Transaction = require('../models/transaction.model');
const cloudinary = require('../../config/cloudinary');
const AppError = require('../utils/AppError');

/**
 * Helper to upload memory file buffer to Cloudinary using streams
 */
const uploadToCloudinary = (fileBuffer, folder = 'receipts') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Handles PDF/Image types
      },
      (error, result) => {
        if (error) return reject(new AppError(`Cloudinary Upload failed: ${error.message}`, 500));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Helper to delete asset from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Log error but don't halt app operational flow
    console.error(`Failed to delete Cloudinary asset: ${publicId}`, error);
  }
};

/**
 * Business logic to create a new transaction
 */
const createTransaction = async (userId, data, file) => {
  let receipt = { url: null, publicId: null };

  if (file) {
    // Upload buffer to Cloudinary
    receipt = await uploadToCloudinary(file.buffer);
  }

  const transaction = await Transaction.create({
    user: userId,
    amount: data.amount,
    type: data.type,
    category: data.category,
    date: data.date,
    description: data.description,
    receipt,
  });

  return transaction;
};

/**
 * Business logic to retrieve transactions list with pagination, range filters, and categories
 */
const getTransactions = async (userId, query) => {
  const { page = 1, limit = 10, type, category, startDate, endDate } = query;
  
  // Construct database filter
  const filter = { user: userId };

  if (type) {
    filter.type = type;
  }
  if (category) {
    filter.category = category;
  }
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skipIndex = (Number(page) - 1) * Number(limit);

  // Retrieve paginated records and total record count concurrently
  const [transactions, totalRecords] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skipIndex)
      .limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecords / Number(limit)),
      totalRecords,
      limit: Number(limit),
    },
  };
};

/**
 * Retrieve details of a single transaction
 */
const getTransactionById = async (userId, transactionId) => {
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  // Authorize: check if user owns this transaction record
  if (transaction.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to view this transaction', 403);
  }

  return transaction;
};

/**
 * Business logic to update details of a transaction
 */
const updateTransaction = async (userId, transactionId, data, file) => {
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  // Authorize ownership check
  if (transaction.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to update this transaction', 403);
  }

  let receipt = transaction.receipt;

  if (file) {
    // Delete legacy receipt from Cloudinary if it exists
    if (transaction.receipt && transaction.receipt.publicId) {
      await deleteFromCloudinary(transaction.receipt.publicId);
    }
    // Upload new receipt buffer
    receipt = await uploadToCloudinary(file.buffer);
  }

  // Apply updates
  transaction.amount = data.amount !== undefined ? data.amount : transaction.amount;
  transaction.type = data.type !== undefined ? data.type : transaction.type;
  transaction.category = data.category !== undefined ? data.category : transaction.category;
  transaction.date = data.date !== undefined ? data.date : transaction.date;
  transaction.description = data.description !== undefined ? data.description : transaction.description;
  transaction.receipt = receipt;

  await transaction.save();
  return transaction;
};

/**
 * Business logic to delete a transaction
 */
const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  // Authorize ownership check
  if (transaction.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to delete this transaction', 403);
  }

  // Clean up associated file asset on Cloudinary
  if (transaction.receipt && transaction.receipt.publicId) {
    await deleteFromCloudinary(transaction.receipt.publicId);
  }

  await transaction.deleteOne();
  return { message: 'Transaction deleted successfully' };
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
