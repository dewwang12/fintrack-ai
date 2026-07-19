/**
 * Higher-order function to wrap async Express controllers and pass errors to next() middleware automatically.
 * Eliminates repetitive try-catch blocks in route controllers.
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = asyncHandler;
