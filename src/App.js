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

const BOTTOM_NAV_HEIGHT = 56;

function App() {
  const [tab, setTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#121212"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#121212",
        color: "#fff"
      }}
    >
      {/* 🔽 SCROLLABLE CONTENT */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pb: `${BOTTOM_NAV_HEIGHT + 48}px`
        }}
      >
        {tab === 0 && <SearchPage />}

        {tab === 1 && isAdmin && <AdminPanel />}

        {tab === 1 && !isAdmin && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error">
              Admin access required
            </Typography>
          </Box>
        )}

        {/* 🦶 FOOTER (NOW VISIBLE) */}
        <Box
          sx={{
            mt: 6,
            py: 3,
            textAlign: "center",
            borderTop: "1px solid #333",
            color: "#888"
          }}
        >
          <Typography variant="body2">
            Circle K Inc. RDC Item Search
          </Typography>
          <Typography variant="caption">
            © {new Date().getFullYear()} • Courtesy of muhammad.azeem@circlek.com
          </Typography>
        </Box>
      </Box>

      {/* 🔒 FIXED BOTTOM NAV */}
      <BottomNavigation
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          height: BOTTOM_NAV_HEIGHT,
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "#1c1c1c",
          borderTop: "1px solid #333"
        }}
      >
        <BottomNavigationAction
          label="Search"
          icon={<SearchIcon />}
          sx={{
            color: tab === 0 ? "#2196f3" : "#777"
          }}
        />

        <BottomNavigationAction
          label="Admin"
          icon={<AdminPanelSettingsIcon />}
          sx={{
            color: tab === 1 ? "#2196f3" : "#777"
          }}
        />
      </BottomNavigation>
    </Box>
  );
}

export default App;
