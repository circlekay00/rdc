import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  limit,
  query
} from "firebase/firestore";

import { db } from "../firebase";

function AdminPanel() {
  const [search, setSearch] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [results, setResults] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    itemDescription: "",
    upcRetail: "",
    itemNumber: "",
    category: ""
  });

  // 🔥 LOAD DATASET ONCE
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

  // 🔍 SAME SEARCH LOGIC AS SEARCH PAGE
  useEffect(() => {
    const text = search.trim().toLowerCase();

    if (text.length === 0) {
      setResults([]);
      return;
    }

    const words = text.split(" ").filter(Boolean);

    const filtered = allItems.filter(item => {
      const haystack = `
        ${item.itemDescription || ""}
        ${item.upcRetail || ""}
        ${item.itemNumber || ""}
        ${item.category || ""}
      `.toLowerCase();

      return words.every(word => haystack.includes(word));
    });

    setResults(filtered);
  }, [search, allItems]);

  // ➕ ADD / ✏️ EDIT
  const handleSave = async () => {
    if (editing) {
      await updateDoc(doc(db, "items", editing.id), form);
    } else {
      await addDoc(collection(db, "items"), form);
    }

    setOpen(false);
    setEditing(null);
    setForm({
      itemDescription: "",
      upcRetail: "",
      itemNumber: "",
      category: ""
    });

    // refresh
    const snap = await getDocs(query(collection(db, "items"), limit(2000)));
    setAllItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // 🗑 DELETE
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "items", id));
    setResults(results.filter(i => i.id !== id));
    setAllItems(allItems.filter(i => i.id !== id));
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* 🔶 TITLE */}
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: 800,
          mb: 2,
          color: "#ff9800"
        }}
      >
        Admin Panel
      </Typography>

      {/* 🔍 SEARCH */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          bgcolor: "#1c1c1c",
          border: "1px solid #ff9800",
          borderRadius: 3
        }}
      >
        <TextField
          fullWidth
          placeholder="Search items (admin)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            sx: { color: "#ff9800", fontSize: "1.1rem" }
          }}
          sx={{ "& fieldset": { border: "none" } }}
        />
      </Paper>

      <Button
        fullWidth
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => {
          setEditing(null);
          setForm({
            itemDescription: "",
            upcRetail: "",
            itemNumber: "",
            category: ""
          });
          setOpen(true);
        }}
      >
        Add Item
      </Button>

      {/* 🚫 NO SEARCH = NO ITEMS */}
      {search.length === 0 && (
        <Typography sx={{ textAlign: "center", opacity: 0.6 }}>
          Start typing to search items
        </Typography>
      )}

      {/* 📋 RESULTS */}
      <List>
        {results.map(item => (
          <ListItem
            key={item.id}
            sx={{
              mb: 1.5,
              bgcolor: "#1e1e1e",
              borderRadius: 3,
              p: 2
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography sx={{ fontWeight: 700, color: "#ff9800" }}>
                {item.itemDescription || "Unnamed Item"}
              </Typography>

              <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>
                UPC: {item.upcRetail || "—"} <br />
                Item #: {item.itemNumber || "—"} <br />
                Category: {item.category || "—"}
              </Typography>

              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => {
                    setEditing(item);
                    setForm(item);
                    setOpen(true);
                  }}
                >
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
            </Box>
          </ListItem>
        ))}
      </List>

      {/* ✏️ MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editing ? "Edit Item" : "Add Item"}
        </DialogTitle>

        <DialogContent>
          {["itemDescription", "upcRetail", "itemNumber", "category"].map(f => (
            <TextField
              key={f}
              fullWidth
              margin="dense"
              label={f}
              value={form[f]}
              onChange={(e) =>
                setForm({ ...form, [f]: e.target.value })
              }
            />
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;
