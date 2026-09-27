import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

export const CLOG_THEME = defineTheme({
  name: "clog",
  extends: neutralTheme,
  typography: { body: { family: "system-ui", fallbacks: "sans-serif" } },
  tokens: {
    "--color-background-body": "#121212",
    "--color-background-surface": "#1c1c1c",
    "--color-background-card": "#1c1c1c",
    "--color-background-popover": "#242424",
    "--color-background-muted": "#161616",
    "--color-text-primary": "#f5f5f5",
    "--color-text-secondary": "#b3b3b3",
    "--color-text-disabled": "#737373",
    "--color-accent": "#ff5722",
    "--color-accent-muted": "#382018",
    "--color-text-accent": "#ff8a65",
    "--color-icon-accent": "#ff8a65",
    "--color-icon-primary": "#f5f5f5",
    "--color-icon-secondary": "var(--color-text-secondary)",
    "--color-icon-disabled": "var(--color-text-disabled)",
    "--color-on-accent": "#121212",
    "--color-on-dark": "#f5f5f5",
    "--color-on-light": "#121212",
    "--color-error": "#ff8a80",
    "--color-error-muted": "#351b1b",
    "--color-on-error": "#121212",
    "--color-warning": "#ffb74d",
    "--color-warning-muted": "#352919",
    "--color-on-warning": "#121212",
    "--color-border": "#383838",
    "--color-border-emphasized": "#626262",
    "--color-neutral": "#ffffff14",
    "--color-skeleton": "#383838",
  },
  localTokens: {
    "--astryx-theme-neutral-color-status-fill-accent": "#ff5722",
    "--astryx-theme-neutral-color-status-muted-accent": "#382018",
  },
  components: {
    button: {
      "variant:secondary": { backgroundColor: "#42251b", color: "#ffab91" },
    },
  },
});
