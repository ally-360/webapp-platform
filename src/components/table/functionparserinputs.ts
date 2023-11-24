export const currencyFormatter = (value: string) => {
  if (!value) return '';

  // Elimina cualquier caracter que no sea numérico y luego formatea
  const onlyNums = value.replace(/\D/g, '');
  return onlyNums.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
export const currencyParser = (value: string) => value.replace(/\./g, '');
