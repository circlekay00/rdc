import { useState } from "react";
import { searchItems } from "../services/searchService";

const ItemSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const data = await searchItems(value);
    setResults(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <input
        type="text"
        placeholder="Search item, category, UPC..."
        value={query}
        onChange={handleChange}
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />

      {loading && <p>Searching...</p>}

      {results.map(item => (
        <div key={item.id} style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
          <strong>{item.itemDescription}</strong>
          <div>{item.category}</div>
          <div>Item #: {item.itemNumber}</div>
          <div>UPC: {item.upcRetail}</div>
        </div>
      ))}
    </div>
  );
};

export default ItemSearch;
