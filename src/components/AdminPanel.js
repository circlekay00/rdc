import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  List,
  ListItem
} from "@mui/material";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { Html5Qrcode } from "html5-qrcode";
import { db } from "../firebase";

/* 🔹 TOKEN GENERATOR */
const buildTokens = (item) => {
  const text = `
    ${item.itemDescription || ""}
    ${item.itemNumber || ""}
    ${item.upcRetail || ""}
    ${item.category || ""}
  `.toLowerCase();

  const tokens = new Set();
  text.split(/\s+/).forEach(word => {
    for (let i = 1; i <= word.length; i++) {
      tokens.add(word.substring(0, i));
    }
  });

  return Array.from(tokens);
};

function AdminPanel() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [scannerOn, setScannerOn] = useState(false);

  const [form, setForm] = useState({
    itemDescription: "",
    itemNumber: "",
    upcRetail: "",
    category: ""
  });

  /* 🔍 SEARCH */
  useEffect(() => {
    const runSearch = async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      const words = search.toLowerCase().split(/\s+/);

      const q = query(
        collection(db, "items"),
        where("searchTokens", "array-contains", words[0])
      );

      const snap = await getDocs(q);

      const ranked = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(item =>
          words.every(w =>
            item.searchTokens?.includes(w) ||
            item.itemDescription?.toLowerCase().includes(w)
          )
        );

      setResults(ranked);
    };

    runSearch();
  }, [search]);

  /* 📸 BARCODE SCANNER */
  useEffect(() => {
    if (!scannerOn) return;

    const scanner = new Html5Qrcode("barcode-reader");

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          scanner.stop();
          setScannerOn(false);

          setForm({
            itemDescription: "",
            itemNumber: "",
            upcRetail: decodedText,
            category: ""
          });

          setEditing(null);
          setShowForm(true);
        }
      )
      .catch(err => console.error("Scanner error", err));

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [scannerOn]);

  /* ➕ ADD / ✏️ UPDATE */
  const saveItem = async () => {
    const payload = {
      ...form,
      searchTokens: buildTokens(form)
    };

    if (editing) {
      await updateDoc(doc(db, "items", editing.id), payload);
    } else {
      await addDoc(collection(db, "items"), payload);
    }

    setForm({
      itemDescription: "",
      itemNumber: "",
      upcRetail: "",
      category: ""
    });
    setEditing(null);
    setShowForm(false);
    setSearch("");
    setResults([]);
  };

  /* 🗑 DELETE */
  const removeItem = async (id) => {
    await deleteDoc(doc(db, "items", id));
    setResults(r => r.filter(i => i.id !== id));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "1.3rem",
          fontWeight: 800,
          color: "#ff9800",
          mb: 2
        }}
      >
        Admin Panel
      </Typography>

      {/* 🔍 SEARCH */}
      <Paper sx={{ p: 1.5, mb: 2, bgcolor: "#1c1c1c", border: "1px solid #ff9800" }}>
        <TextField
          fullWidth
          placeholder="Search items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ sx: { color: "#ff9800" } }}
          sx={{ "& fieldset": { border: "none" } }}
        />
      </Paper>

      {/* 📸 SCAN BUTTON */}
      <Button
        fullWidth
        variant="contained"
        sx={{ mb: 1, bgcolor: "#1976d2" }}
        onClick={() => setScannerOn(true)}
      >
        Scan Barcode to Add Item
      </Button>

      {/* 📷 CAMERA */}
      {scannerOn && (
        <Paper sx={{ p: 1, mb: 2 }}>
          <div id="barcode-reader" style={{ width: "100%" }} />
          <Button
            fullWidth
            color="error"
            onClick={() => setScannerOn(false)}
          >
            Cancel Scan
          </Button>
        </Paper>
      )}

      {/* ➕ ADD BUTTON */}
      <Button
        fullWidth
        variant="contained"
        sx={{ mb: 2, bgcolor: "#ff9800" }}
        onClick={() => {
          setShowForm(!showForm);
          setEditing(null);
        }}
      >
        {showForm ? "Cancel" : "Add Item Manually"}
      </Button>

      {/* 📝 FORM */}
      {showForm && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "#1e1e1e" }}>
          {["itemDescription", "itemNumber", "upcRetail", "category"].map(f => (
            <TextField
              key={f}
              fullWidth
              label={f}
              value={form[f]}
              onChange={e =>
                setForm({ ...form, [f]: e.target.value })
              }
              sx={{ mb: 1 }}
              InputProps={{ sx: { color: "#fff" } }}
            />
          ))}

          <Button
            fullWidth
            variant="contained"
            sx={{ bgcolor: "#ff9800" }}
            onClick={saveItem}
          >
            Save Item
          </Button>
        </Paper>
      )}

      {/* 📋 RESULTS */}
      <List>
  {results.map(item => (
    <ListItem
      key={item.id}
      sx={{
        mb: 1.5,
        borderRadius: 3,
        bgcolor: "#1e1e1e",
        p: 2,
        display: "flex",
        justifyContent: "space-between"
      }}
    >
      <Box sx={{ flex: 1 }}>
        {/* 🔶 DESCRIPTION */}
        <Typography
          sx={{
            fontSize: "1.05rem",
            fontWeight: 700,
            background: "linear-gradient(90deg,#ff9800,#ffb74d)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          {item.itemDescription || "Unnamed Item"}
        </Typography>

        {/* 🔹 DETAILS */}
        <Typography sx={{ fontSize: "0.85rem", color: "#aaa", mt: 0.5 }}>
          Item #: {item.itemNumber || "—"} <br />
          UPC: {item.upcRetail || "—"} <br />
          Category: {item.category || "—"}
        </Typography>
      </Box>

      {/* 🛠 ACTIONS */}
      <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
        <Button
          size="small"
          sx={{ color: "#4fc3f7" }}
          onClick={() => {
            setEditing(item);
            setForm(item);
            setShowForm(true);
          }}
        >
          Edit
        </Button>

        <Button
          size="small"
          color="error"
          onClick={() => removeItem(item.id)}
        >
          Delete
        </Button>
      </Box>
    </ListItem>
  ))}
</List>

    </Box>
  );
}

export default AdminPanel;
