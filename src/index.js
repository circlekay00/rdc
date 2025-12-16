import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./firebase";
import "./index.css";

import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1c1c1c"
    }
  },
  typography: {
    fontFamily: "Josefin Sans, sans-serif"
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
