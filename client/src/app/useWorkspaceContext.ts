import { useContext } from "react";
import { WORKSPACE_CONTEXT } from "./WorkspaceContext";

export function useWorkspaceContext() {
  const value = useContext(WORKSPACE_CONTEXT);
  if (!value) throw new Error("Workspace actions require an active route.");
  return value;
}
