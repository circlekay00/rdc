import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
      onClose();
    } catch (err) {
      setError("Invalid admin credentials");
    }

    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          bgcolor: "#121212",
          color: "#fff",
          borderRadius: 3
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 700,
          color: "#ff9800"
        }}
      >
        Admin Login
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{
              sx: {
                color: "#fff",
                bgcolor: "#1c1c1c"
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{
              sx: {
                color: "#fff",
                bgcolor: "#1c1c1c"
              }
            }}
          />

          {error && (
            <Typography
              sx={{
                color: "error.main",
                mt: 2,
                textAlign: "center"
              }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          sx={{ color: "#aaa" }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            bgcolor: "#ff9800",
            color: "#000",
            fontWeight: 700,
            "&:hover": { bgcolor: "#ffb74d" }
          }}
        >
          {loading ? "Signing in…" : "Login"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AdminLoginModal;
