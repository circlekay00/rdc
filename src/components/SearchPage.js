import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  Paper
} from "@mui/material";

import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase";

function SearchPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Load a reasonable dataset ONLY ONCE
  useEffect(() => {
    const loadItems = async () => {
      const q = query(collection(db, "items"), limit(2000));
      const snap = await getDocs(q);

      setAllItems(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    };

    loadItems();
  }, []);

  // 🔍 TRUE LETTER-BY-LETTER + MULTI-WORD SEARCH
  useEffect(() => {
    const runSearch = () => {
      const text = search.trim().toLowerCase();

      if (text.length === 0) {
        setResults([]);
        return;
      }

      setLoading(true);

      const words = text.split(" ").filter(Boolean);

      const filtered = allItems.filter(item => {
        const haystack = `
          ${item.itemDescription || ""}
          ${item.upcRetail || ""}
          ${item.itemNumber || ""}
          ${item.category || ""}
        `.toLowerCase();

        // ✅ ALL WORDS MUST MATCH (anywhere, partial allowed)
        return words.every(word => haystack.includes(word));
      });

      setResults(filtered);
      setLoading(false);
    };

    runSearch();
  }, [search, allItems]);

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
          placeholder="Search item, UPC, number, category…"
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
            input: { padding: "14px" }
          }}
        />
      </Paper>

      {/* EMPTY STATE */}
      {search.length === 0 && (
        <Typography sx={{ textAlign: "center", opacity: 0.6, mt: 4 }}>
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
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  background: "linear-gradient(90deg,#ff9800,#ffb74d)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {item.itemDescription || "Unnamed Item"}
              </Typography>

              <Typography sx={{ fontSize: "0.9rem", color: "#aaa" }}>
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
