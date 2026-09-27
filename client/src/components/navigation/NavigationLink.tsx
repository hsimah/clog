import type { ComponentPropsWithRef } from "react";
import { createLink } from "@tsquid/routes/Link";
import { APP_ROUTES } from "../../routes/AppRoutes";

const PRELOADING_LINK = createLink(APP_ROUTES);

/** Astryx supplies href; tsquid preloads the matching route on hover and focus. */
export function NavigationLink({ href, ...props }: ComponentPropsWithRef<"a">) {
  if (
    !href ||
    !href.startsWith("/") ||
    href.startsWith("//") ||
    href.startsWith("/auth/")
  )
    return <a href={href} {...props} />;
  return <PRELOADING_LINK to={href} {...props} />;
}
