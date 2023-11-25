/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    screens: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1400px",
    },
    fontSize: {},
    fontFamily: {
      sans: ['"Inter", sans-serif'],
    },
    extend: {
      colors: {
        primary: "#D4009B",
        "font-primary": "#334155",
        "font-secondary": "#64748B",
        bg: "#E9ECEF",
        hover: "#F8F9FA",
        line: "#DEE2E6",
        "role-1": "#8082FF",
        "role-2": "#F4A76F",
        "role-3": "#57D2A9",
        "role-other": "#64748B",
        gray: {
          100: "#F8F9FA",
          200: "#E9ECEF",
          300: "#DEE2E6",
          400: "#CED4DA",
          500: "#ADB5BD",
          600: "#6C757D",
          700: "#495057",
          800: "#343A40",
          900: "#212529",
        },
      },
      spacing: {
        192: "192px",
      },
      fontSize: {
        h1: [
          "40px",
          {
            lineHeight: "150%",
            letterSpacing: "-0.8px",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        h2: [
          "32px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        h3: [
          "28px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        h4: [
          "24px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        h5: [
          "20px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        h6: [
          "16px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Roboto",
          },
        ],
        "body-1": [
          "16px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "400",
            fontFamily: "Roboto",
          },
        ],
        "body-2": [
          "14px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "400",
            fontFamily: "Roboto",
          },
        ],
        "body-2-b": [
          "14px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Roboto",
          },
        ],
        small: [
          "12px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "400",
            fontFamily: "Inter",
          },
        ],
        "h1-xs": [
          "33.52px",
          {
            lineHeight: "150%",
            letterSpacing: "-0.8px",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        "h2-xs": [
          "28.11px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        "h3-xs": [
          "25.41px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        "h4-xs": [
          "22.7px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        "h5-xs": [
          "20px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Inter",
          },
        ],
        "h6-xs": [
          "16px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "700",
            fontFamily: "Roboto",
          },
        ],
        "body-1-xs": [
          "16px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "400",
            fontFamily: "Roboto",
          },
        ],
        "body-2-xs": [
          "14px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "400",
            fontFamily: "Roboto",
          },
        ],
        "small-xs": [
          "12px",
          {
            lineHeight: "150%",
            letterSpacing: "normal",
            fontWeight: "400",
            fontFamily: "Inter",
          },
        ],
      },
      animation: {
        marquee: "marquee 10s linear infinite",
        fadeInUp: "fadeInUp 0.2s ease-out",
        fadeOutDown: "fadeOutDown 0.2s ease-in",
        fadeOut: "fadeOut 0.5s ease-out",
        float2: `float 2s ease-in-out infinite`,
        float3: `float 3s ease-in-out infinite`,
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        fadeInUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0%)" },
        },
        fadeOutDown: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100%)" },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        float: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
