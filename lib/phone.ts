// // utils/phone.ts (TS) or utils/phone.js (JS)
// import { parsePhoneNumberFromString } from 'libphonenumber-js';

// // Optional: allow simple characters in inputs for HTML pattern (not validation)
// export const LOOSE_PHONE_INPUT_PATTERN = /^[+\d][\d\s().-]{5,24}$/;

// /**
//  * Normalize any phone number to E.164 (e.g., +14155552671).
//  * If the number is given without country calling code, pass a default ISO country (e.g., 'US', 'PK').
//  * Returns the E.164 string or throws Error if invalid.
//  */
// export function normalizePhoneToE164(input: string, defaultCountry?: string): string {
//   if (!input || typeof input !== 'string') throw new Error('Phone is required');

//   // lib handles spaces/dashes/() etc.
//   const phone = parsePhoneNumberFromString(input, defaultCountry);
//   if (!phone || !phone.isValid()) throw new Error('Enter a valid phone number');

//   return phone.number; // E.164, e.g. "+14155552671"
// }

// /**
//  * Quick boolean check (same rules as normalize).
//  */
// export function isValidPhone(input: string, defaultCountry?: string): boolean {
//   try {
//     return !!parsePhoneNumberFromString(input, defaultCountry)?.isValid();
//   } catch {
//     return false;
//   }
// }

// /**
//  * Pretty formatting for display (not for saving).
//  * Example: "+14155552671" -> "(415) 555-2671" (with US default), or international format if no country.
//  */
// export function formatForDisplay(input: string, defaultCountry?: string): string {
//   const phone = parsePhoneNumberFromString(input, defaultCountry);
//   return phone ? phone.formatInternational() : input;
// }
