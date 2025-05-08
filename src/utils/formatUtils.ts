
/**
 * Format a number as currency with the specified currency code
 */
export const formatCurrency = (amount: number, currencyCode: string = "USD"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2
  }).format(amount);
};
