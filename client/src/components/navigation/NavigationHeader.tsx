import { Text } from "@astryxdesign/core/Text";
import { useState } from "react";
import { useLocation } from "react-router";
import { Button } from "@astryxdesign/core/Button";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import * as stylex from "@stylexjs/stylex";
import {
  HomeURI,
  ItemIndexURI,
  LocationIndexURI,
  InventoryIndexURI,
} from "../../routes/__generated__/routes";
import { SESSION } from "../../lib/session";
import clogLogo from "../../assets/clog-white.png";

const NAV_ITEMS = [
  { path: HomeURI.getURI({}), label: "Overview" },
  { path: ItemIndexURI.getURI({}), label: "Items" },
  { path: LocationIndexURI.getURI({}), label: "Locations" },
  { path: InventoryIndexURI.getURI({}), label: "Inventory" },
];

export function NavigationHeader() {
  const { pathname, error, signOut } = useNavigationHeader();
  return (
    <>
      <TopNav
        xstyle={styles.nav}
        label="Main navigation"
        heading={
          <TopNavHeading
            heading="clog"
            headingHref={HomeURI.getURI({})}
            logo={<img src={clogLogo} {...stylex.props(styles.logo)} alt="" />}
          />
        }
        startContent={NAV_ITEMS.map((item) => (
          <TopNavItem
            key={item.path}
            href={item.path}
            label={item.label}
            xstyle={[
              styles.tab,
              (pathname === item.path ||
                pathname.startsWith(`${item.path}/`)) &&
                styles.selectedTab,
            ]}
            isSelected={
              pathname === item.path || pathname.startsWith(`${item.path}/`)
            }
          />
        ))}
        endContent={
          <Button label="Sign out" variant="ghost" onClick={signOut} />
        }
      />
      {error && <Text role="alert">{error}</Text>}
    </>
  );
}

function useNavigationHeader() {
  const { pathname } = useLocation();
  const [error, setError] = useState("");

  function signOut() {
    if (
      window.confirm(
        "Sign out? Unsaved changes in Clog tabs will be discarded.",
      )
    ) {
      void SESSION.logout().catch(() =>
        setError("Could not sign out. Please try again."),
      );
    }
  }
  return { pathname, error, signOut };
}

const styles = stylex.create({
  nav: {
    backgroundColor: "var(--color-background-muted)",
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: "var(--color-accent)",
  },
  tab: {
    color: "var(--color-text-accent)",
    borderRadius: "var(--radius-element)",
    backgroundColor: {
      default: "transparent",
      ":hover": "var(--color-accent-muted)",
    },
    transition:
      "background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
  },
  selectedTab: {
    color: "var(--color-on-accent)",
    backgroundColor: {
      default: "var(--color-accent)",
      ":hover": "var(--color-text-accent)",
    },
    boxShadow: "var(--shadow-low)",
    fontWeight: 700,
  },
  logo: {
    width: "var(--spacing-8)",
    height: "var(--spacing-8)",
    objectFit: "contain",
    flexShrink: 0,
  },
});
