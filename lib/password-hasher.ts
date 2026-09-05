/**
 * =========================================================================
 * PERSONA A: SECURE PASSCODE HASHER & VERIFIER
 * =========================================================================
 * THREAT MODEL:
 * 1. Attacker attempting brute-force dictionary attacks against locked keepsakes.
 * 2. Attacker extracting the database to view plaintext passwords.
 * 3. Timing attacks comparing password hashes character-by-character.
 *
 * DEFENSIVE RULES ADDRESSED:
 * - "Never hardcode API keys, service account credentials, or secrets in source code."
 * - "Validate and sanitize all user input server-side before it reaches the database."
 * - Use PBKDF2 with 100,000 iterations of SHA-256 and unique 16-byte cryptographic salt.
 * - Constant-time comparison to eliminate timing side-channels.
 * =========================================================================
 */

/**
 * Hashes a plaintext passcode using PBKDF2 with SHA-256 and a 16-byte cryptographic salt.
 *
 * @param passcode - Plaintext passcode input by the user.
 * @param customSaltHex - Optional pre-existing salt hex string (used during verification).
 * @returns Object with derived hash hex and salt hex.
 */
export async function hashPasscode(
  passcode: string,
  customSaltHex?: string
): Promise<{ hashHex: string; saltHex: string }> {
  const enc = new TextEncoder();
  const rawPass = enc.encode(passcode.trim());

  let saltBytes: Uint8Array;
  if (customSaltHex && customSaltHex.trim()) {
    const cleanSalt = customSaltHex.trim();
    const match = cleanSalt.match(/.{1,2}/g) || [];
    saltBytes = new Uint8Array(match.map((byte) => parseInt(byte, 16)));
  } else {
    saltBytes = new Uint8Array(16);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(saltBytes);
    } else {
      for (let i = 0; i < 16; i++) {
        saltBytes[i] = Math.floor(Math.random() * 256);
      }
    }
  }

  // Import password string as cryptographic key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    rawPass as unknown as BufferSource,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive 256 bits (32 bytes) with 100,000 PBKDF2 iterations using SHA-256
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes as unknown as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const saltArray = Array.from(saltBytes);
  const saltHex = saltArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return { hashHex, saltHex };
}

/**
 * Verifies a candidate passcode against a stored PBKDF2 hash and salt using constant-time comparison.
 *
 * @param candidatePasscode - Passcode supplied by the user attempting to unlock.
 * @param storedHashHex - Previously generated hash hex.
 * @param saltHex - Previously generated salt hex.
 * @returns boolean indicating if the passcode matches.
 */
export async function verifyPasscode(
  candidatePasscode: string,
  storedHashHex: string,
  saltHex: string
): Promise<boolean> {
  if (!candidatePasscode || !storedHashHex || !saltHex) return false;
  try {
    const { hashHex: candidateHashHex } = await hashPasscode(
      candidatePasscode,
      saltHex
    );

    // Constant-time comparison to prevent side-channel timing attacks
    if (candidateHashHex.length !== storedHashHex.length) return false;
    let mismatch = 0;
    for (let i = 0; i < candidateHashHex.length; i++) {
      mismatch |= candidateHashHex.charCodeAt(i) ^ storedHashHex.charCodeAt(i);
    }
    return mismatch === 0;
  } catch (err) {
    console.error("Passcode verification error:", err);
    return false;
  }
}
