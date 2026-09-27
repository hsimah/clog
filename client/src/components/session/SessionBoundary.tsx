import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Link } from "@astryxdesign/core/Link";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import * as stylex from "@stylexjs/stylex";
import { SESSION } from "../../lib/session";

export function SessionBoundary({ children }: { children: ReactNode }) {
  const { session, active, ended, checkSession } = useSessionBoundary();
  return (
    <>
      {!active && (
        <main {...stylex.props(styles.session)} aria-label="Session">
          <Stack gap={4}>
            <Text as="h1" type="display-3">
              {session.status === "checking"
                ? "Checking your session…"
                : ended
                  ? "Session ended"
                  : session.status === "unavailable"
                    ? "Could not check your session"
                    : "Sign in to continue"}
            </Text>
            {session.status !== "checking" && (
              <>
                <Text>
                  {ended
                    ? "Reload to continue with the current account. Previous account data has been cleared."
                    : "Your unsaved input stays in this tab. Sign in in another tab, then check your session here."}
                </Text>
                <Link
                  href={SESSION.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Clog sign-in
                </Link>
                <Button
                  variant="secondary"
                  label={ended ? "Reload Clog" : "Check session"}
                  onClick={checkSession}
                />
              </>
            )}
          </Stack>
        </main>
      )}
      <Stack hidden={!active} inert={!active} xstyle={!active && styles.hidden}>
        {session.userId !== null && !ended ? children : null}
      </Stack>
    </>
  );
}

function useSessionBoundary() {
  const session = useSyncExternalStore(
    SESSION.subscribeSession,
    SESSION.getSessionSnapshot,
  );
  useEffect(() => {
    const check = () => {
      void SESSION.refreshSession().catch(() => {});
    };
    check();
    const timer = window.setInterval(check, 30_000);
    const visibility = () =>
      document.hidden ? SESSION.suspendSession() : check();
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    window.addEventListener("pagehide", SESSION.suspendSession);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
      window.removeEventListener("pagehide", SESSION.suspendSession);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const active = session.status === "active";
  const ended = ["changed", "signed-out"].includes(session.status);

  function checkSession() {
    if (ended) location.reload();
    else void SESSION.refreshSession().catch(() => {});
  }
  return { session, active, ended, checkSession };
}

const styles = stylex.create({
  hidden: { display: "none" },
  session: {
    marginInline: "auto",
    maxWidth: "32rem",
    padding: "var(--spacing-8)",
  },
});
