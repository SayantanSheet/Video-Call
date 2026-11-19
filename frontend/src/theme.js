import { createTheme } from "@mui/material/styles";

/**
 * The single source of visual truth. Previously createTheme() was called in
 * three files and rendered through a ThemeProvider in none of them, so the live
 * app ran on raw MUI light defaults.
 *
 * Keep these hex values in sync with the CSS custom properties in index.css —
 * the meeting room does its layout in a CSS module and needs the same palette.
 */
export const palette = {
  surface0: "#0F1115",
  surface1: "#171A21",
  surface2: "#1E222B",
  border: "rgba(255, 255, 255, 0.08)",
  accent: "#6366F1",
  accentHover: "#818CF8",
  textHigh: "#E8EAED",
  textLow: "#9AA0A6",
  danger: "#EF4444",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: palette.accent, light: palette.accentHover, contrastText: "#FFFFFF" },
    error: { main: palette.danger },
    background: { default: palette.surface0, paper: palette.surface1 },
    text: { primary: palette.textHigh, secondary: palette.textLow },
    divider: palette.border,
  },

  shape: { borderRadius: 12 },

  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontSize: "1.25rem", fontWeight: 600 },
    h6: { fontSize: "1.05rem", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Focus must stay visible for keyboard users; the previous UI had no
        // focus styling at all.
        ":focus-visible": {
          outline: `2px solid ${palette.accent}`,
          outlineOffset: "2px",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 20, paddingBlock: 10 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", border: `1px solid ${palette.border}` },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "medium" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: palette.surface2 },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});

export default theme;
