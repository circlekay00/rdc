import { useState } from "react";
import { Dialog, DialogTitle, TextField, Button } from "@mui/material";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { buildSearchTokens } from "../utils/searchTokens";


export default function AdminItemModal({ open, onClose, item }) {
const [form, setForm] = useState(item || {});


const save = async () => {
const payload = {
...form,
searchTokens: buildSearchTokens(
`${form.itemDescription} ${form.itemNumber} ${form.upcRetail} ${form.category}`
),
updatedAt: serverTimestamp()
};


if (item?.id) {
await updateDoc(doc(db, "items", item.id), payload);
} else {
await addDoc(collection(db, "items"), {
...payload,
createdAt: serverTimestamp()
});
}


onClose();
};


return (
<Dialog open={open} onClose={onClose} fullWidth>
<DialogTitle>{item ? "Edit Item" : "Add Item"}</DialogTitle>
<TextField label="Description" onChange={e => setForm({ ...form, itemDescription: e.target.value })} />
<TextField label="Item Number" onChange={e => setForm({ ...form, itemNumber: e.target.value })} />
<TextField label="UPC Retail" onChange={e => setForm({ ...form, upcRetail: e.target.value })} />
<TextField label="UPC Case" onChange={e => setForm({ ...form, upcCase: e.target.value })} />
<TextField label="Category" onChange={e => setForm({ ...form, category: e.target.value })} />
<Button onClick={save} sx={{ m: 2 }} variant="contained">Save</Button>
</Dialog>
);
}