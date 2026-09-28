import { useLocation } from "react-router";
import { UserMenu } from "../user/UserMenu";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import * as stylex from "@stylexjs/stylex";
import {
  HomeURI,
  ItemIndexURI,
  LocationIndexURI,
  InventoryIndexURI,
} from "../../routes/__generated__/routes";
import clogLogo from "../../assets/clog-white.png";

const NAV_ITEMS = [
  { path: HomeURI.getURI({}), label: "Overview" },
  { path: ItemIndexURI.getURI({}), label: "Items" },
  { path: LocationIndexURI.getURI({}), label: "Locations" },
  { path: InventoryIndexURI.getURI({}), label: "Inventory" },
];

export function NavigationHeader() {
  const { pathname } = useLocation();
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
        endContent={<UserMenu />}
      />
    </>
  );
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
