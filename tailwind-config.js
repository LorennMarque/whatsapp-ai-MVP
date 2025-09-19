window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#38e07b",
        "background-light": "#f6f8f7",
        "background-dark": "#122017",
        "content-light": "#122017",
        "content-dark": "#f6f8f7",
        "subtle-light": "#e8f2ec",
        "subtle-dark": "#2a3c31",
        "border-light": "#d1e6d9",
        "border-dark": "#3d5446",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
    },
  },
};
