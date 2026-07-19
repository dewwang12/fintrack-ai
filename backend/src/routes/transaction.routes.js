const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validation.middleware');
const {
  createTransactionSchema,
  updateTransactionSchema,
} = require('../validators/transaction.validator');

const router = express.Router();

// Apply authorization requirement to all transaction endpoints
router.use(protect);

router
  .route('/')
  .post(
    upload.single('receipt'), // Intercept receipt multi-part uploads if present
    validate(createTransactionSchema),
    transactionController.create
  )
  .get(transactionController.getAll);

router.post(
  '/scan',
  upload.single('receipt'), // Parse multipart file stream
  transactionController.scan
);

router
  .route('/:id')
  .get(transactionController.getOne)
  .put(
    upload.single('receipt'),
    validate(updateTransactionSchema),
    transactionController.update
  )
  .delete(transactionController.remove);

module.exports = router;
