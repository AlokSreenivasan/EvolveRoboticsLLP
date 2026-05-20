import { CONTACT_NUMBER_MAX_LENGTH } from './formatContactNumber';

/** Contact number must be exactly 10 numeric digits. */
export function isValidContactNumber(contactNumber: string): boolean {
  return new RegExp(`^\\d{${CONTACT_NUMBER_MAX_LENGTH}}$`).test(contactNumber);
}
