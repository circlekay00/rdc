import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import {
Dialog,
DialogTitle,
DialogContent,
TextField,
Button,
Typography
} from "@mui/material";


export default function AdminLogin({ open }) {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");


const handleLogin = async () => {
setError("");
try {
await signInWithEmailAndPassword(auth, email, password);
} catch (err) {
setError("Invalid credentials");
}
};


return (
<Dialog open={open}>
<DialogTitle>Admin Login</DialogTitle>
<DialogContent sx={{ display: "grid", gap: 2 }}>
<TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
<TextField type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} />
{error && <Typography color="error">{error}</Typography>}
<Button variant="contained" color="warning" onClick={handleLogin}>
Login
</Button>
</DialogContent>
</Dialog>
);
}