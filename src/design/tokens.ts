// design/tokens.ts
export const tokens = {
  colors: {
    // Light theme — bold & vibrant colors
    light: {
      bg: "#F8FAFE",
      surface: "#FFFFFF",
      surfaceMuted: "#F2F4FA",
      border: "#E6E8F2",

      primary: "#4169E1",          // royal blue (bold & professional)
      primaryHover: "#2952CC",
      primarySurface: "#E6EBFF",

      secondary: "#FF6B35",        // vibrant coral-orange
      secondaryHover: "#E55527",

      accent: "#00B894",           // vivid teal
      accentHover: "#009876",

      success: "#00B574",          // vibrant green
      warning: "#FFA500",          // pure orange
      danger:  "#DC3545",          // strong red

      text: "#0F172A",
      textMuted: "#667085",
      link: "#5E76F2",
      focus: "#6F87FF",
      
      // icon colors
      icon: "#475569",          // neutral slate for all icons
      iconMuted: "#94A3B8",     // lighter for disabled/secondary icons

      // translucents
      overlay: "rgba(15, 23, 42, 0.45)",
      shadow: "rgba(2, 6, 23, 0.08)",
    },

    // Dark theme — bold & vibrant for dark mode
    dark: {
      bg: "#0B1220",
      surface: "#0F172A",
      surfaceMuted: "#121C30",
      border: "#23324A",

      primary: "#6B8AFF",          // bright blue for dark mode
      primaryHover: "#8BA3FF",
      primarySurface: "#1A2440",

      secondary: "#FF8A5B",        // bright coral for dark
      secondaryHover: "#FFA07A",

      accent: "#26D0B4",           // bright teal
      accentHover: "#4DDBC0",

      success: "#28C76F",          // bright green
      warning: "#FFB946",          // bright amber
      danger:  "#FF6B6B",          // bright red

      text: "#E6E9F2",
      textMuted: "#A9B0BD",
      link: "#A3B0FF",
      focus: "#91A3FF",
      
      // icon colors
      icon: "#CBD5E1",          // neutral slate for all icons in dark mode
      iconMuted: "#64748B",     // darker for disabled/secondary icons

      overlay: "rgba(0, 0, 0, 0.6)",
      shadow: "rgba(0, 0, 0, 0.45)",
    },
  },

  typography: {
    fontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji"`,
    weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    sizes: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
    },
    lineHeights: { tight: 1.2, snug: 1.3, normal: 1.5, relaxed: 1.7 },
  },

  spacing: {
    0: "0px",
    0.5: "2px",
    1: "4px",
    1.5: "6px",
    2: "8px",
    2.5: "10px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    7: "28px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
  },

  radius: {
    xs: "6px",
    sm: "10px",
    md: "14px",
    lg: "20px",
    xl: "28px",
    pill: "999px",
  },

  border: {
    hairline: "1px",
    thin: "1.5px",
    thick: "2px",
  },

  shadow: {
    sm: "0 1px 3px rgba(0,0,0,0.06)",
    md: "0 4px 16px rgba(0,0,0,0.08)",
    lg: "0 10px 30px rgba(0,0,0,0.10)",
  },

  motion: {
    duration: { fast: "120ms", base: "180ms", slow: "280ms" },
    easing: { out: "cubic-bezier(.2,.8,.2,1)", inOut: "cubic-bezier(.4,0,.2,1)" },
  },

  icons: {
    sizes: { xs: 14, sm: 16, md: 18, lg: 20, xl: 24, "2xl": 28 },
    strokeWidth: 1.75,
  },

  z: { dropdown: 1000, modal: 1300, popover: 1200, toast: 1400 },
  container: { max: "1200px", gutter: "16px" },
} as const;

export type TokenColors = typeof tokens.colors.light;
export type Theme = 'light' | 'dark';
