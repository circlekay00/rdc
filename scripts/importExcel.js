/**
 * importExcel.js
 * --------------------------------------------------
 * Imports items from an Excel file into Firestore
 * with PARTIAL / LETTER-BASED SEARCH (N-GRAMS).
 *
 * Excel Column Order (LEFT → RIGHT):
 * A: ITEM DESCRIPTION
 * B: CATEGORY
 * C: UPC
 * D: ITEM NUMBER
 *
 * Features:
 * - Auto-creates `items` collection
 * - Batched writes (500 per batch)
 * - Cleans & normalizes text
 * - Generates substring search tokens
 * --------------------------------------------------
 */

/* -------------------------
 * Dependencies
 * ------------------------- */
const admin = require("firebase-admin");
const XLSX = require("xlsx");
const path = require("path");

/* -------------------------
 * Firebase Admin Init
 * ------------------------- */
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* -------------------------
 * Load Excel File
 * ------------------------- */
const filePath = path.join(__dirname, "items.xlsx");
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert sheet to array-of-arrays
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Remove header row
rows.shift();

console.log(`📄 Found ${rows.length} data rows`);

/* -------------------------
 * Search Token Generator
 * (Partial / Letter-Based)
 * ------------------------- */
function generateSearchTokens(values) {
  const tokens = new Set();

  values.forEach(value => {
    if (!value) return;

    const cleaned = value
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ");

    cleaned.split(/\s+/).forEach(word => {
      if (word.length < 2) return;

      // Generate all substrings (n-grams)
      for (let start = 0; start < word.length; start++) {
        for (let end = start + 1; end <= word.length; end++) {
          tokens.add(word.substring(start, end));
        }
      }
    });
  });

  return Array.from(tokens);
}

/* -------------------------
 * Import Logic
 * ------------------------- */
async function importItems() {
  let batch = db.batch();
  let batchCount = 0;
  let totalCount = 0;

  for (const row of rows) {
    if (!row || row.length === 0) continue;

    const item = {
      itemDescription: row[0]?.toString().trim() || "",
      category: row[1]?.toString().trim() || "",
      upc: row[2]?.toString().trim() || "",
      itemNumber: row[3]?.toString().trim() || ""
    };

    const searchTokens = generateSearchTokens([
      item.itemDescription,
      item.category,
      item.itemNumber,
      item.upc
    ]);

    const docRef = db.collection("items").doc();

    batch.set(docRef, {
      ...item,
      searchTokens,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    batchCount++;
    totalCount++;

    // Commit every 500 documents
    if (batchCount === 500) {
      await batch.commit();
      console.log(`✅ Committed ${totalCount} items...`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit remaining documents
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`🎉 Import complete: ${totalCount} items added`);
}

/* -------------------------
 * Run Script
 * ------------------------- */
importItems()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Import failed:", error);
    process.exit(1);
  });
