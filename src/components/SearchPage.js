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
  getDocs
} from "firebase/firestore";

import { db } from "../firebase";

function SearchPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 🚀 DEBOUNCE SEARCH (300ms)
    const delay = setTimeout(async () => {
      const term = search.trim().toLowerCase();

      if (!term) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 🔥 FETCH ONCE, FILTER FAST (small dataset)
        const snap = await getDocs(collection(db, "items"));

        const filtered = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(item =>
            item.searchTokens?.some(token =>
              token.includes(term)
            )
          );

        setResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
      }

      setLoading(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <Box sx={{ p: 2 }}>
      {/* 🔶 TITLE */}
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "1.6rem",
          fontWeight: 800,
          mb: 2,
          background: "linear-gradient(90deg,#ff9800,#ffb74d)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
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
          placeholder="Search by description, UPC, or item #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            sx: {
              color: "#fff",
              fontSize: "1.1rem"
            }
          }}
          sx={{
            "& fieldset": { border: "none" },
            input: { padding: "12px" }
          }}
        />
      </Paper>

      {/* 💤 EMPTY STATE */}
      {!search && (
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

      {/* ⏳ LOADING */}
      {loading && (
        <Typography sx={{ textAlign: "center", mt: 2 }}>
          Searching…
        </Typography>
      )}

      {/* 🔎 RESULTS */}
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
              <Typography
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  background: "linear-gradient(90deg,#ff9800,#ffb74d)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {item.itemDescription || "Unnamed Item"}
              </Typography>

              <Typography sx={{ fontSize: "0.9rem", color: "#aaa", mt: 0.5 }}>
                UPC: {item.upcRetail || "—"} <br />
                Item #: {item.itemNumber || "—"} <br />
                Category: {item.category || "—"}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default SearchPage;
