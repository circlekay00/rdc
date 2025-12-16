import React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export default function BottomNav({ tab, setTab, isAdmin }) {
  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
      elevation={8}
    >
      <BottomNavigation
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        showLabels
      >
        <BottomNavigationAction
          label="Search"
          value="search"
          icon={<SearchIcon />}
        />

        {isAdmin && (
          <BottomNavigationAction
            label="Admin"
            value="admin"
            icon={<AdminPanelSettingsIcon />}
          />
        )}
      </BottomNavigation>
    </Paper>
  );
}
