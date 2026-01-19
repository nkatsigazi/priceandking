export const formatCurrency = (value: number | string | undefined | null) => {
  if (value === undefined || value === null || value === '') return '$0.00';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  
  // Checks if the parsing failed
  if (isNaN(number)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

// Use this for non-currency numbers (like quantities)
export const formatNumber = (value: number | string) => {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US').format(number);
};