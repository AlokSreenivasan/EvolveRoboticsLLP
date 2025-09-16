export function isValidEmail(email:string) : boolean {
  // Simple regex for email validation
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}
