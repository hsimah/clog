/** Mirrors the server rule: bcrypt reads at most 72 bytes, so limits count bytes. */
export function getPasswordError(
  password: string,
  confirmation: string,
  label = "New password",
) {
  const length = new TextEncoder().encode(password).length;
  if (length < 12 || length > 72 || password.includes("\0")) {
    return `${label} must be 12–72 bytes and contain no null characters.`;
  }
  if (password !== confirmation) return "Passwords do not match.";
  return "";
}
