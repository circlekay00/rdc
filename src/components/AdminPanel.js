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
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";

const emptyForm = {
  itemDescription: "",
  category: "",
  itemNumber: "",
  upcRetail: "",
  upcCase: ""
};

function AdminPanel() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // 🔍 SEARCH ONLY WHEN TYPING
  useEffect(() => {
    const runSearch = async () => {
      if (!search.trim()) {
        setItems([]);
        return;
      }

      setLoading(true);

      const q = query(
        collection(db, "items"),
        where("searchTokens", "array-contains", search.toLowerCase())
      );

      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));

      setLoading(false);
    };

    runSearch();
  }, [search]);

  // 🔤 SEARCH TOKENS (LETTER-LEVEL)
  const buildTokens = (text) => {
    const tokens = [];
    text
      .toLowerCase()
      .split(" ")
      .forEach(word => {
        for (let i = 1; i <= word.length; i++) {
          tokens.push(word.slice(0, i));
        }
      });
    return [...new Set(tokens)];
  };

  // 💾 SAVE ITEM
  const saveItem = async () => {
    if (!form.itemDescription.trim()) return;

    const payload = {
      itemDescription: form.itemDescription.trim(),
      category: form.category || "",
      itemNumber: form.itemNumber || "",
      upcRetail: form.upcRetail || "",
      upcCase: form.upcCase || "",
      searchTokens: buildTokens(
        `${form.itemDescription} ${form.category} ${form.itemNumber} ${form.upcRetail}`
      ),
      updatedAt: serverTimestamp()
    };

    if (editing) {
      await updateDoc(doc(db, "items", editing.id), payload);
      setItems(prev =>
        prev.map(item =>
          item.id === editing.id ? { ...item, ...payload } : item
        )
      );
    } else {
      const ref = await addDoc(collection(db, "items"), {
        ...payload,
        createdAt: serverTimestamp()
      });
      setItems(prev => [{ id: ref.id, ...payload }, ...prev]);
    }

    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  // 🗑 DELETE
  const removeItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteDoc(doc(db, "items", id));
    setItems(items.filter(i => i.id !== id));
  };

  // 🔒 LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}
      >
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#ff9800"
          }}
        >
          Admin Panel
        </Typography>

        <Button
          onClick={handleLogout}
          sx={{
            border: "1px solid #ff9800",
            color: "#ff9800",
            fontWeight: 700,
            borderRadius: 3
          }}
        >
          Logout
        </Button>
      </Box>

      {/* ADD */}
      <Button
        fullWidth
        onClick={() => {
          setEditing(null);
          setForm(emptyForm);
          setOpen(true);
        }}
        sx={{
          mb: 2,
          bgcolor: "#ff9800",
          color: "#000",
          fontWeight: 700,
          borderRadius: 3,
          py: 1.2
        }}
      >
        ➕ Add Item
      </Button>

      {/* SEARCH */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          bgcolor: "#1c1c1c",
          borderRadius: 3,
          border: "1px solid #ff9800"
        }}
      >
        <TextField
          fullWidth
          placeholder="Search items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            sx: {
              color: "#ff9800",
              caretColor: "#ff9800",
              fontSize: "1.1rem"
            }
          }}
          sx={{
            "& fieldset": { border: "none" },
            "& input::placeholder": { color: "#ffb74d" }
          }}
        />
      </Paper>

      {search === "" && (
        <Typography sx={{ textAlign: "center", opacity: 0.6, mt: 3 }}>
          Start typing to search items
        </Typography>
      )}

      {/* RESULTS */}
      <List>
        {items.map(item => (
          <ListItem
            key={item.id}
            sx={{
              bgcolor: "#1e1e1e",
              mb: 1.5,
              borderRadius: 3,
              p: 2,
              flexDirection: "column",
              alignItems: "flex-start"
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2rem",
                fontWeight: 800,
                background: "linear-gradient(90deg, #ff9800, #ffb74d)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              {item.itemDescription || "Unnamed Item"}
            </Typography>

            <Typography sx={{ fontSize: "0.9rem", color: "#aaa", mb: 1 }}>
              Item #: {item.itemNumber || "—"} | UPC: {item.upcRetail || "—"}
              <br />
              Category: {item.category || "—"}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
              <Button
                fullWidth
                onClick={() => {
                  setEditing(item);
                  setForm({
                    itemDescription: item.itemDescription || "",
                    category: item.category || "",
                    itemNumber: item.itemNumber || "",
                    upcRetail: item.upcRetail || "",
                    upcCase: item.upcCase || ""
                  });
                  setOpen(true);
                }}
                sx={{ border: "1px solid #ff9800", color: "#ff9800" }}
              >
                Edit
              </Button>

              <Button
                fullWidth
                onClick={() => removeItem(item.id)}
                sx={{ border: "1px solid #f44336", color: "#f44336" }}
              >
                Delete
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle sx={{ bgcolor: "#121212", color: "#ff9800" }}>
          {editing ? "Edit Item" : "Add Item"}
        </DialogTitle>

        <DialogContent sx={{ bgcolor: "#121212" }}>
          {Object.keys(emptyForm).map(key => (
            <TextField
              key={key}
              fullWidth
              label={key}
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
              sx={{
                mt: 2,
                input: { color: "#fff" },
                label: { color: "#ff9800" }
              }}
            />
          ))}
        </DialogContent>

        <DialogActions sx={{ bgcolor: "#121212" }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveItem} sx={{ color: "#ff9800" }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;
