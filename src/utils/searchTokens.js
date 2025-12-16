export const buildSearchTokens = (text = "") => {
const clean = text.toLowerCase().replace(/[^a-z0-9]/g, " ");
const tokens = new Set();


clean.split(" ").forEach(word => {
for (let i = 1; i <= word.length; i++) {
tokens.add(word.slice(0, i));
}
});


return Array.from(tokens);
};