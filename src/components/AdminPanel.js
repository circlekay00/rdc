import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";

/* -------------------- SEARCH RANKING -------------------- */
const rankResults = (items, search) => {
  const terms = search.toLowerCase().split(" ");

  return items
    .map(item => {
      const text = `
        ${item.itemDescription || ""}
        ${item.itemNumber || ""}
        ${item.upcRetail || ""}
        ${item.category || ""}
      `.toLowerCase();

      let score = 0;

      terms.forEach(t => {
        if (text === t) score += 100;
        if (text.startsWith(t)) score += 50;
        if (text.includes(t)) score += 10;
      });

      return { ...item, _score: score };
    })
    .filter(i => i._score > 0)
    .sort((a, b) => b._score - a._score);
};

/* -------------------- ADMIN PANEL -------------------- */
function AdminPanel() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    itemDescription: "",
    itemNumber: "",
    upcRetail: "",
    category: ""
  });

  /* -------------------- SEARCH -------------------- */
  useEffect(() => {
    const runSearch = async () => {
      const value = search.trim();

      if (!value) {
        setResults([]);
        return;
      }

      setLoading(true);

      const q = query(
        collection(db, "items"),
        where(
          "searchTokens",
          "array-contains-any",
          value.toLowerCase().split(" ")
        )
      );

      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      setResults(rankResults(items, value));
      setLoading(false);
    };

    runSearch();
  }, [search]);

  /* -------------------- FORM HANDLERS -------------------- */
  const openAdd = () => {
    setEditing(null);
    setForm({
      itemDescription: "",
      itemNumber: "",
      upcRetail: "",
      category: ""
    });
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      itemDescription: item.itemDescription || "",
      itemNumber: item.itemNumber || "",
      upcRetail: item.upcRetail || "",
      category: item.category || ""
    });
    setOpen(true);
  };

  const saveItem = async () => {
    const tokens = `${form.itemDescription} ${form.itemNumber} ${form.upcRetail} ${form.category}`
      .toLowerCase()
      .split(" ")
      .filter(Boolean);

    if (editing) {
      await updateDoc(doc(db, "items", editing.id), {
        ...form,
        searchTokens: tokens
      });
    } else {
      await addDoc(collection(db, "items"), {
        ...form,
        searchTokens: tokens
      });
    }

    setOpen(false);
    setSearch("");
    setResults([]);
  };

  const removeItem = async (id) => {
    await deleteDoc(doc(db, "items", id));
    setResults(results.filter(i => i.id !== id));
  };

  const logout = async () => {
    await signOut(auth);
  };

  /* -------------------- UI -------------------- */
  return (
    <Box sx={{ p: 2 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2
        }}
      >
        <Typography
          sx={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#ff9800",
            fontFamily: "Josefin Sans"
          }}
        >
          Admin Panel
        </Typography>

        <IconButton onClick={logout}>
          <LogoutIcon sx={{ color: "#ff9800" }} />
        </IconButton>
      </Box>

      {/* SEARCH BOX */}
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
          placeholder="Search items"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            sx: { color: "#ff9800", fontSize: "1rem" }
          }}
          sx={{ "& fieldset": { border: "none" } }}
        />
      </Paper>

      {/* ADD BUTTON */}
      <Button
        fullWidth
        startIcon={<AddIcon />}
        onClick={openAdd}
        sx={{
          mb: 2,
          bgcolor: "#333",
          color: "#ff9800",
          borderRadius: 3,
          py: 1
        }}
      >
        Add Item
      </Button>

      {/* RESULTS */}
      <List>
        {results.map(item => (
          <ListItem
            key={item.id}
            sx={{
              bgcolor: "#1e1e1e",
              borderRadius: 3,
              mb: 1.5,
              p: 2
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ color: "#ff9800", fontWeight: 600 }}>
                {item.itemDescription}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#aaa" }}>
                UPC: {item.upcRetail || "—"} <br />
                Item #: {item.itemNumber || "—"} <br />
                Category: {item.category || "—"}
              </Typography>
            </Box>

            <IconButton onClick={() => openEdit(item)}>
              <EditIcon sx={{ color: "#ff9800" }} />
            </IconButton>

            <IconButton onClick={() => removeItem(item.id)}>
              <DeleteIcon sx={{ color: "#f44336" }} />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle sx={{ bgcolor: "#222", color: "#ff9800" }}>
          {editing ? "Edit Item" : "Add Item"}
        </DialogTitle>

        <DialogContent sx={{ bgcolor: "#1c1c1c" }}>
          {["itemDescription", "itemNumber", "upcRetail", "category"].map(f => (
            <TextField
              key={f}
              fullWidth
              label={f}
              value={form[f]}
              onChange={e => setForm({ ...form, [f]: e.target.value })}
              sx={{
                mt: 2,
                input: { color: "#fff" },
                label: { color: "#ff9800" }
              }}
            />
          ))}
        </DialogContent>

        <DialogActions sx={{ bgcolor: "#1c1c1c" }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#aaa" }}>
            Cancel
          </Button>
          <Button onClick={saveItem} sx={{ color: "#ff9800" }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;
