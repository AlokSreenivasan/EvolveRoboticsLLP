export function isValidEmail(email:string) : boolean {
  // Simple regex for email validation
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return regex.test(email.trim());
}
