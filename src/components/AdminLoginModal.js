import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box
} from "@mui/material";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function AdminLoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose(); // 🔥 CLOSE MODAL ON SUCCESS
    } catch (err) {
      setError("Invalid admin credentials");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 800,
          color: "#ff9800"
        }}
      >
        Admin Login
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          {error && (
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              mt: 1,
              bgcolor: "#ff9800",
              fontWeight: 700
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default AdminLoginModal;
