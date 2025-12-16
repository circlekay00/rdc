import React, { useEffect, useState } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Typography
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import SearchPage from "./components/SearchPage";
import AdminPanel from "./components/AdminPanel";
import AdminLoginModal from "./components/AdminLoginModal";

function App() {
  const [tab, setTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const handleTabChange = (e, value) => {
    // 🔐 ADMIN TAB CLICKED
    if (value === 1 && !isAdmin) {
      setShowAdminLogin(true);
      return;
    }
    setTab(value);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#121212"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", bgcolor: "#121212", color: "#fff" }}>
      <Box sx={{ pb: 7 }}>
        {tab === 0 && <SearchPage />}
        {tab === 1 && isAdmin && <AdminPanel />}

        {tab === 1 && !isAdmin && (
          <Typography sx={{ textAlign: "center", mt: 4, opacity: 0.7 }}>
            Admin login required
          </Typography>
        )}
      </Box>

      {/* 🔐 ADMIN LOGIN MODAL */}
      <AdminLoginModal
        open={showAdminLogin}
        onClose={() => {
          setShowAdminLogin(false);
          setTab(0);
        }}
      />

      {/* 🔻 BOTTOM NAV */}
      <BottomNavigation
        value={tab}
        onChange={handleTabChange}
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
        />

        <BottomNavigationAction
          label="Admin"
          icon={<AdminPanelSettingsIcon />}
        />
      </BottomNavigation>
    </Box>
  );
}

export default App;
