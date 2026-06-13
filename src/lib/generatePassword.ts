/**
 * Generates a cryptographically secure random password of the given length.
 * Guarantees at least one uppercase letter, one lowercase letter, one digit,
 * and one symbol so it passes the app's strength rules.
 */

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

function randomChar(charset: string): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return charset[array[0] % charset.length];
}

/**
 * Returns a secure random password of `length` characters (default 12).
 * Each call produces a unique value with ≥1 char from each required class.
 */
export function generatePassword(length = 12): string {
  if (length < 4) throw new Error("Password length must be at least 4");

  // Guarantee one character from each required class
  const required = [
    randomChar(UPPER),
    randomChar(LOWER),
    randomChar(DIGITS),
    randomChar(SYMBOLS),
  ];

  // Fill the rest with random chars from the full pool
  const rest: string[] = [];
  for (let i = 4; i < length; i++) {
    rest.push(randomChar(ALL));
  }

  // Shuffle all characters using Fisher-Yates with crypto randomness
  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i--) {
    const indexArray = new Uint32Array(1);
    crypto.getRandomValues(indexArray);
    const j = indexArray[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
