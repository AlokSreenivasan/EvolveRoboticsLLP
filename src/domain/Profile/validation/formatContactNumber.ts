const CONTACT_NUMBER_LENGTH = 10;

/** Strips non-digits and caps length at 10 for contact number input. */
export function formatContactNumberInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, CONTACT_NUMBER_LENGTH);
}

export const CONTACT_NUMBER_MAX_LENGTH = CONTACT_NUMBER_LENGTH;
