import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "../firebase";

export const searchItems = async (searchText) => {
  if (!searchText || searchText.length < 2) return [];

  const words = searchText
    .toLowerCase()
    .split(/[\s\-_/]+/)
    .filter(w => w.length > 1);

  if (words.length === 0) return [];

  // Firestore can only handle ONE array-contains
  const q = query(
    collection(db, "items"),
    where("searchTokens", "array-contains", words[0]),
    limit(50)
  );

  const snapshot = await getDocs(q);

  // Client-side filtering for remaining words
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(item =>
      words.every(word =>
        item.searchTokens.includes(word)
      )
    );
};
