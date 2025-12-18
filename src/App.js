import React, { useEffect, useState } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Typography,
  Button
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import SearchPage from "./components/SearchPage";
import AdminPanel from "./components/AdminPanel";
import AdminLoginModal from "./components/AdminLoginModal";

function App() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult(true);
        setIsAdmin(token.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    setTab(0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          bgcolor: "#121212",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress sx={{ color: "#ff9800" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#121212",
        color: "#fff",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* 🔶 HEADER */}
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "#ff9800"
          }}
        >
          Search RDC Items
        </Typography>
      </Box>

      {/* 🔶 CONTENT */}
      <Box sx={{ flex: 1, overflow: "auto", pb: 7 }}>
        {tab === 0 && <SearchPage />}

        {tab === 1 && isAdmin && <AdminPanel />}

        {tab === 1 && !isAdmin && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography sx={{ mb: 2 }}>
              Admin access required
            </Typography>

            <Button
              variant="contained"
              onClick={() => setShowAdminLogin(true)}
              sx={{
                bgcolor: "#ff9800",
                color: "#000",
                fontWeight: 700,
                "&:hover": { bgcolor: "#ffb74d" }
              }}
            >
              Admin Login
            </Button>
          </Box>
        )}
      </Box>

      {/* 🔶 ADMIN LOGOUT */}
      {isAdmin && (
        <Box sx={{ textAlign: "center", pb: 1 }}>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              color: "#ff9800",
              fontWeight: 600
            }}
          >
            Logout Admin
          </Button>
        </Box>
      )}

      {/* 🔶 BOTTOM NAV */}
      <BottomNavigation
        value={tab}
        onChange={(e, v) => setTab(v)}
        showLabels
        sx={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          bgcolor: "#1c1c1c",
          borderTop: "1px solid #333"
        }}
      >
        <BottomNavigationAction
          label="Search"
          icon={<SearchIcon />}
          sx={{
            color: tab === 0 ? "#2196f3" : "#aaa"
          }}
        />

        <BottomNavigationAction
          label="Admin"
          icon={<AdminPanelSettingsIcon />}
          sx={{
            color: tab === 1 ? "#2196f3" : "#aaa"
          }}
        />
      </BottomNavigation>

      {/* 🔐 ADMIN LOGIN MODAL */}
      <AdminLoginModal
        open={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />
    </Box>
  );
}

export default App;
