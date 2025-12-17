import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  List,
  ListItem,
  Paper,
  Stack,
  Divider,
  IconButton
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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

import { db } from "../firebase";

function AdminPanel() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    itemDescription: "",
    itemNumber: "",
    upcRetail: "",
    category: ""
  });

  const searchRequestId = useRef(0);

  useEffect(() => {
    const runSearch = async () => {
      const currentRequest = ++searchRequestId.current;

      const tokens = search
        .toLowerCase()
        .split(" ")
        .map(t => t.trim())
        .filter(Boolean);

      if (tokens.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const q = query(
        collection(db, "items"),
        where("searchTokens", "array-contains-any", tokens)
      );

      const snap = await getDocs(q);

      if (currentRequest !== searchRequestId.current) return;

      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    runSearch();
  }, [search]);

  const buildTokens = (item) => {
    const text = `${item.itemDescription} ${item.itemNumber} ${item.upcRetail} ${item.category}`.toLowerCase();
    const tokens = new Set();

    text.split(" ").forEach(word => {
      for (let i = 1; i <= word.length; i++) {
        tokens.add(word.slice(0, i));
      }
    });

    return Array.from(tokens);
  };

  const saveItem = async () => {
    const payload = {
      ...form,
      searchTokens: buildTokens(form)
    };

    if (editingItem) {
      await updateDoc(doc(db, "items", editingItem.id), payload);
    } else {
      await addDoc(collection(db, "items"), payload);
    }

    setFormOpen(false);
    setEditingItem(null);
    setForm({
      itemDescription: "",
      itemNumber: "",
      upcRetail: "",
      category: ""
    });
  };

  const editItem = (item) => {
    setEditingItem(item);
    setForm({
      itemDescription: item.itemDescription || "",
      itemNumber: item.itemNumber || "",
      upcRetail: item.upcRetail || "",
      category: item.category || ""
    });
    setFormOpen(true);
  };

  const removeItem = async (id) => {
    await deleteDoc(doc(db, "items", id));
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const fieldStyle = {
    bgcolor: "#2b2b2b",
    borderRadius: 2,
    input: { color: "#fff" },
    label: { color: "#ff9800" }
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#121212", minHeight: "100vh" }}>
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "1.4rem",
          fontWeight: 800,
          mb: 2,
          fontFamily: "Josefin Sans",
          background: "linear-gradient(90deg,#ff9800,#ffb74d)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        Admin Panel
      </Typography>

      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 3,
          bgcolor: "#2a2a2a",
          border: "1px solid #ff9800"
        }}
      >
        <TextField
          fullWidth
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            sx: { color: "#ff9800", fontSize: "1rem" }
          }}
          sx={{ "& fieldset": { border: "none" } }}
        />
      </Paper>

      <Button
        fullWidth
        onClick={() => setFormOpen(true)}
        sx={{
          mb: 2,
          py: 1.2,
          bgcolor: "#555",
          color: "#fff",
          fontWeight: 700,
          borderRadius: 3,
          "&:hover": {
            bgcolor: "#ff9800",
            color: "#000"
          }
        }}
      >
        ➕ Add New Item
      </Button>

      {formOpen && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            bgcolor: "#1f1f1f",
            border: "1px solid #555"
          }}
        >
          <Typography sx={{ mb: 1.5, color: "#ff9800", fontWeight: 700 }}>
            {editingItem ? "Edit Item" : "Add Item"}
          </Typography>

          <Stack spacing={1.5}>
            <TextField label="Description" value={form.itemDescription} onChange={e => setForm({ ...form, itemDescription: e.target.value })} sx={fieldStyle} />
            <TextField label="Item Number" value={form.itemNumber} onChange={e => setForm({ ...form, itemNumber: e.target.value })} sx={fieldStyle} />
            <TextField label="UPC" value={form.upcRetail} onChange={e => setForm({ ...form, upcRetail: e.target.value })} sx={fieldStyle} />
            <TextField label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} sx={fieldStyle} />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained" onClick={saveItem} sx={{ bgcolor: "#ff9800", color: "#000", fontWeight: 700 }}>
              Save
            </Button>
            <Button fullWidth onClick={() => setFormOpen(false)} sx={{ bgcolor: "#333", color: "#fff" }}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      )}

      <List>
        {items.map(item => (
          <ListItem
            key={item.id}
            sx={{
              mb: 1.5,
              p: 2,
              borderRadius: 3,
              bgcolor: "#1c1c1c",
              border: "1px solid #333"
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(90deg,#ff9800,#ffb74d)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {item.itemDescription || "Unnamed Item"}
              </Typography>

              <Typography sx={{ fontSize: "0.8rem", color: "#aaa", mt: 0.5 }}>
                UPC: {item.upcRetail || "—"} <br />
                Item #: {item.itemNumber || "—"} <br />
                Category: {item.category || "—"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <IconButton onClick={() => editItem(item)} sx={{ color: "#ff9800" }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => removeItem(item.id)} sx={{ color: "#ff5252" }}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </ListItem>
        ))}
      </List>

      {loading && (
        <Typography sx={{ textAlign: "center", mt: 2, opacity: 0.7 }}>
          Searching…
        </Typography>
      )}
    </Box>
  );
}

export default AdminPanel;
