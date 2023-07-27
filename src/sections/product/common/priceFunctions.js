export function calculatePriceSale(priceBase, taxPercentage) {
  if (priceBase === 0 || Number.isNaN(priceBase) || typeof priceBase === 'string') return 0;
  if (taxPercentage === 0) return priceBase;

  const taxAmount = (priceBase * taxPercentage) / 100; // Calcular el monto del impuesto
  const priceSale = priceBase + taxAmount; // Calcular el precio total sumando el monto del impuesto
  if (priceSale % 1 !== 0) {
    return Number(priceSale.toFixed(2));
  }
  // Verificar si es un string
  return priceSale;
}

export function calculatePriceBase(priceSale, taxPercentage) {
  if (priceSale === 0 || Number.isNaN(priceSale)) return 0;
  const priceBase = (priceSale * 100) / (100 + taxPercentage); // Calcular el precio base
  if (priceBase % 1 !== 0) {
    return Number(priceBase.toFixed(2));
  }

  return priceBase;
}
