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
  const [debounced, setDebounced] = useState("");

  /* 🔹 DEBOUNCE (INSTANT FEEL) */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
    }, 250); // ⚡ instant but safe

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const runSearch = async () => {
      const term = debounced.trim().toLowerCase();

      if (!term) {
        setResults([]);
        return;
      }

      const words = term.split(/\s+/);

      setLoading(true);

      try {
        /* 🔍 FIRESTORE QUERY (FIRST WORD ONLY) */
        const q = query(
          collection(db, "items"),
          where("searchTokens", "array-contains", words[0])
        );

        const snap = await getDocs(q);

        /* 🧠 MULTI-WORD FILTER + RANK */
        const ranked = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .map(item => {
            const tokens = item.searchTokens || [];

            let score = 0;
            let matchesAll = true;

            for (const w of words) {
              if (tokens.includes(w)) {
                score += 10;
              } else {
                matchesAll = false;
              }
            }

            // Boost exact description hits
            if (
              item.itemDescription
                ?.toLowerCase()
                .includes(term)
            ) {
              score += 20;
            }

            return matchesAll ? { ...item, score } : null;
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);

        setResults(ranked);
      } catch (err) {
        console.error("Search error:", err);
      }

      setLoading(false);
    };

    runSearch();
  }, [debounced]);

  return (
    <Box sx={{ p: 2 }}>
      {/* 🔶 TITLE */}
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "1.35rem",
          fontWeight: 800,
          color: "#ff9800",
          mb: 2
        }}
      >
        RDC Item Search
      </Typography>

      {/* 🔍 SEARCH */}
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
          placeholder="Search any words, UPC, item number…"
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

      {/* 💤 EMPTY */}
      {!search && (
        <Typography sx={{ textAlign: "center", opacity: 0.6, mt: 4 }}>
          Start typing to search items
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
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  background:
                    "linear-gradient(90deg,#ff9800,#ffb74d)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {item.itemDescription || "Unnamed Item"}
              </Typography>

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
