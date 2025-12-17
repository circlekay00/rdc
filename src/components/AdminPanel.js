import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  List,
  ListItem,
  Paper
} from "@mui/material";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";

/* 🔍 SEARCH TOKEN BUILDER */
function buildSearchTokens(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const tokens = new Set();

  lower.split(/\s+/).forEach(word => {
    for (let i = 1; i <= word.length; i++) {
      tokens.add(word.slice(0, i));
    }
  });

  return Array.from(tokens);
}

function AdminPanel() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    itemDescription: "",
    category: "",
    itemNumber: "",
    upcCase: "",
    upcRetail: ""
  });

  /* 🔎 SEARCH ITEMS (ADMIN) */
  useEffect(() => {
    const runSearch = async () => {
      if (search.trim().length === 0) {
        setItems([]);
        return;
      }

      const q = query(
        collection(db, "items"),
        where("searchTokens", "array-contains", search.toLowerCase())
      );

      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    runSearch();
  }, [search]);

  /* ➕ ADD / ✏️ UPDATE ITEM */
  const handleSave = async () => {
    if (!form.itemDescription.trim()) return;

    const searchTokens = buildSearchTokens(
      `${form.itemDescription} ${form.category} ${form.itemNumber} ${form.upcRetail}`
    );

    if (editingId) {
      await updateDoc(doc(db, "items", editingId), {
        ...form,
        searchTokens,
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, "items"), {
        ...form,
        searchTokens,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // reset
    setForm({
      itemDescription: "",
      category: "",
      itemNumber: "",
      upcCase: "",
      upcRetail: ""
    });

    setEditingId(null);
    setShowForm(false);
  };

  /* ✏️ START EDIT */
  const startEdit = (item) => {
    setEditingId(item.id);
    setShowForm(true);
    setForm({
      itemDescription: item.itemDescription || "",
      category: item.category || "",
      itemNumber: item.itemNumber || "",
      upcCase: item.upcCase || "",
      upcRetail: item.upcRetail || ""
    });
  };

  /* 🗑 DELETE ITEM */
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "items", id));
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* 🔶 TITLE */}
      <Typography
        sx={{
          textAlign: "center",
          fontWeight: 800,
          fontSize: "1.1rem",
          color: "#ff9800",
          mb: 2
        }}
      >
        Admin Panel
      </Typography>

      {/* 🔍 SEARCH BAR */}
      <Paper
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
          placeholder="Search items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            sx: { color: "#ff9800" }
          }}
          sx={{
            "& fieldset": { border: "none" },
            input: { padding: "12px" }
          }}
        />
      </Paper>

      {/* ➕ ADD ITEM BUTTON */}
      <Button
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => {
          setShowForm(true);
          setEditingId(null);
          setForm({
            itemDescription: "",
            category: "",
            itemNumber: "",
            upcCase: "",
            upcRetail: ""
          });
        }}
      >
        Add Item
      </Button>

      {/* 📝 ADD / EDIT FORM (HIDDEN UNTIL CLICKED) */}
      {showForm && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#1e1e1e" }}>
          {Object.keys(form).map(key => (
            <TextField
              key={key}
              fullWidth
              label={key}
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
              sx={{ mb: 1 }}
            />
          ))}

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button fullWidth variant="contained" onClick={handleSave}>
              {editingId ? "Update Item" : "Save Item"}
            </Button>

            <Button
              fullWidth
              color="error"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      )}

      {/* 📦 SEARCH RESULTS */}
      <List>
        {items.map(item => (
          <ListItem
            key={item.id}
            sx={{
              mb: 1,
              bgcolor: "#1c1c1c",
              borderRadius: 2,
              flexDirection: "column",
              alignItems: "flex-start"
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              {item.itemDescription || "Unnamed Item"}
            </Typography>

            <Typography sx={{ fontSize: "0.8rem", opacity: 0.7 }}>
              #{item.itemNumber || "—"} • {item.category || "—"}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button size="small" onClick={() => startEdit(item)}>
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>

      {search.length === 0 && (
        <Typography sx={{ textAlign: "center", opacity: 0.6, mt: 3 }}>
          Start typing to search items
        </Typography>
      )}
    </Box>
  );
}

export default AdminPanel;
