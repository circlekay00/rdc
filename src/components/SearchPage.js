import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  Paper
} from "@mui/material";

import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { db } from "../firebase";

function SearchPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const runSearch = async () => {
      const trimmed = search.trim().toLowerCase();

      if (trimmed.length === 0) {
        setResults([]);
        return;
      }

      // ✅ IMPORTANT FIX:
      // Search ONLY the last word typed
      const lastWord = trimmed.split(" ").pop();

      setLoading(true);

      try {
        const q = query(
          collection(db, "items"),
          where("searchTokens", "array-contains", lastWord)
        );

        const snap = await getDocs(q);

        setResults(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        );
      } catch (err) {
        console.error("Search error:", err);
      }

      setLoading(false);
    };

    runSearch();
  }, [search]);

  return (
    <Box sx={{ p: 2 }}>
      {/* 🔶 TITLE */}
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "1.3rem",
          fontWeight: 800,
          color: "#ff9800",
          mb: 2
        }}
      >
        RDC Item Search
      </Typography>

      {/* 🔍 SEARCH BOX */}
      <Paper
        elevation={4}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 3,
          bgcolor: "#1c1c1c",
          border: "1px solid #ff9800"
        }}
      >
        <TextField
          fullWidth
          placeholder="Search by description, UPC, item number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            sx: {
              color: "#fff",
              fontSize: "1.05rem"
            }
          }}
          sx={{
            "& fieldset": { border: "none" },
            input: { padding: "12px" }
          }}
        />
      </Paper>

      {/* EMPTY STATE */}
      {search.length === 0 && (
        <Typography
          sx={{
            textAlign: "center",
            opacity: 0.6,
            mt: 4
          }}
        >
          Start typing to search items
        </Typography>
      )}

      {/* RESULTS */}
      <List>
        {results.map(item => (
          <ListItem
            key={item.id}
            sx={{
              mb: 1.5,
              borderRadius: 3,
              bgcolor: "#1e1e1e",
              p: 2
            }}
          >
            <Box>
              {/* 🔶 DESCRIPTION (BIG + GRADIENT) */}
              <Typography
                sx={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  background: "linear-gradient(90deg,#ff9800,#ffb74d)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {item.itemDescription || "Unnamed Item"}
              </Typography>

              {/* META */}
              <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>
                UPC: {item.upcRetail || "—"} <br />
                Item #: {item.itemNumber || "—"} <br />
                Category: {item.category || "—"}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>

      {loading && (
        <Typography sx={{ textAlign: "center", mt: 2 }}>
          Searching…
        </Typography>
      )}
    </Box>
  );
}

export default SearchPage;
