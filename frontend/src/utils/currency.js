/**
 * Helper to format a numeric amount as currency string.
 */
export const formatCurrency = (amount, locale = 'en-IN', currency = 'INR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export default formatCurrency;
