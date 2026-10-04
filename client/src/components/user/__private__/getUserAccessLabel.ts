/** Shared by the users table and detail panel so access reads the same everywhere. */
export function getUserAccessLabel(user: {
  role: string;
  isAdmin: boolean;
}) {
  const role = user.role === "EDITOR" ? "Editor" : "Reader";
  return user.isAdmin ? `${role}, administrator` : role;
}
