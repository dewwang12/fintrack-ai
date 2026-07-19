const express = require('express');
const budgetController = require('../controllers/budget.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { createBudgetSchema, updateBudgetSchema } = require('../validators/budget.validator');

const router = express.Router();

// Apply auth lock to all budget routes
router.use(protect);

router
  .route('/')
  .post(validate(createBudgetSchema), budgetController.create)
  .get(budgetController.getAll);

router
  .route('/:id')
  .put(validate(updateBudgetSchema), budgetController.update)
  .delete(budgetController.remove);

module.exports = router;
