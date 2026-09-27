import { Stack } from "@astryxdesign/core/Stack";
import type { ReactNode } from "react";
import { AppShell } from "@astryxdesign/core/AppShell";
import { LinkProvider } from "@astryxdesign/core/Link";
import * as stylex from "@stylexjs/stylex";
import { NavigationHeader } from "./NavigationHeader";
import { NavigationLink } from "./NavigationLink";

export function NavigationShell({ children }: NavigationShellProps) {
  return (
    <LinkProvider component={NavigationLink}>
      <AppShell
        height="auto"
        variant="section"
        contentPadding={4}
        topNav={<NavigationHeader />}
        mobileNav={{ breakpoint: "md" }}
      >
        <Stack width="100%" maxWidth={1440} xstyle={styles.content}>
          {children}
        </Stack>
      </AppShell>
    </LinkProvider>
  );
}

interface NavigationShellProps {
  children: ReactNode;
}

const styles = stylex.create({
  content: { marginInline: "auto", minWidth: 0 },
});
