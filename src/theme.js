import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1e1e1e"
    },
    primary: {
      main: "#2196f3" // blue active buttons
    }
  },

  typography: {
    fontFamily: "'Josefin Sans', system-ui, sans-serif",

    h4: {
      fontSize: "1.25rem",
      fontWeight: 700
    },

    h5: {
      fontSize: "1.15rem",
      fontWeight: 700
    },

    h6: {
      fontSize: "1rem",
      fontWeight: 600
    },

    body1: {
      fontSize: "0.95rem"
    },

    body2: {
      fontSize: "0.85rem",
      color: "#bdbdbd"
    },

    caption: {
      fontSize: "0.75rem",
      color: "#9e9e9e"
    }
  },

  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& input": {
            fontSize: "0.95rem"
          }
        }
      }
    },

    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 10,
          paddingBottom: 10
        }
      }
    },

    MuiBottomNavigationAction: {
      styleOverrides: {
        label: {
          fontSize: "0.7rem"
        }
      }
    }
  }
});

export default theme;
