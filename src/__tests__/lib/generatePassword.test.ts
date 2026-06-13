import { generatePassword } from "../../lib/generatePassword";

describe("generatePassword", () => {
  it("generates a password of the default length (12)", () => {
    const pw = generatePassword();
    expect(pw).toHaveLength(12);
  });

  it("generates a password of a custom length", () => {
    const pw = generatePassword(16);
    expect(pw).toHaveLength(16);
  });

  it("contains at least one uppercase letter", () => {
    const pw = generatePassword();
    expect(/[A-Z]/.test(pw)).toBe(true);
  });

  it("contains at least one lowercase letter", () => {
    const pw = generatePassword();
    expect(/[a-z]/.test(pw)).toBe(true);
  });

  it("contains at least one digit", () => {
    const pw = generatePassword();
    expect(/[0-9]/.test(pw)).toBe(true);
  });

  it("contains at least one symbol", () => {
    const pw = generatePassword();
    expect(/[^A-Za-z0-9]/.test(pw)).toBe(true);
  });

  it("produces different values on consecutive calls (uniqueness)", () => {
    const passwords = new Set(Array.from({ length: 20 }, () => generatePassword()));
    // Extremely unlikely to get duplicates in 20 crypto-random 12-char passwords
    expect(passwords.size).toBeGreaterThan(15);
  });

  it("only uses characters from the expected charset", () => {
    const allowed = /^[A-Za-z0-9!@#$%^&*()\-_=+[\]{}|;:,.<>?]+$/;
    for (let i = 0; i < 50; i++) {
      expect(generatePassword()).toMatch(allowed);
    }
  });

  it("throws when length is less than 4", () => {
    expect(() => generatePassword(3)).toThrow();
  });
});
