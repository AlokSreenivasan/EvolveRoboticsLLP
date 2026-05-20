/** Basic contact validation — digits only, 10–15 characters. */
export function isValidContactNumber(contactNumber: string): boolean {
  const digits = contactNumber.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}
