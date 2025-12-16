import { createTheme } from "@mui/material/styles";


const theme = createTheme({
palette: {
mode: "dark",
primary: { main: "#ff7a00" },
background: {
default: "#0f0f0f",
paper: "#1a1a1a"
}
},
shape: { borderRadius: 14 }
});


export default theme;