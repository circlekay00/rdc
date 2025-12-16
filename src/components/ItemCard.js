import { useState } from "react";
import { Box, Typography, Collapse, Paper } from "@mui/material";

const highlight = (text = "", query = "") => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "ig");

  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span
        key={i}
        style={{
          backgroundColor: "#ff7a00",
          color: "#000",
          padding: "0 2px",
          borderRadius: 4
        }}
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

export default function ItemCard({ item, query }) {
  const [open, setOpen] = useState(false);

  return (
    <Paper
      sx={{ p: 2, mb: 1, cursor: "pointer" }}
      onClick={() => setOpen(!open)}
    >
      {/* DESCRIPTION */}
      <Typography fontWeight={600} fontSize={16}>
        {highlight(item.itemDescription, query)}
      </Typography>

      {/* ALWAYS VISIBLE SUMMARY */}
      <Typography fontSize={13} color="text.secondary">
        Item #: {item.itemNumber || "—"} · {item.category || "—"}
      </Typography>

      {/* EXPANDED DETAILS */}
      <Collapse in={open}>
        <Box sx={{ mt: 1, fontSize: 14 }}>
          {item.upcRetail && <div>UPC Retail: {item.upcRetail}</div>}
          {item.upcCase && <div>UPC Case: {item.upcCase}</div>}
        </Box>
      </Collapse>
    </Paper>
  );
}
